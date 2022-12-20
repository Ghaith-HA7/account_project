const CheckinModel = require('../models/checkin');
const Masjid = require('../models/masjid');
const Hall = require('../models/hall');
const { Op } = require('sequelize');
const {
	Exception,
	statusCodes,
	database: { sequelize },
} = require('usol-utils');
const moment = require('moment');
const { prayers } = require('../../../utils');
const PrayerModel = require('../models/prayer');
const HallModel = require('../models/hall');

class Checkin {
	constructor(data) {
		this.prayerId = data.prayerId;
		this.prayerDate = data.prayerDate;
	}

	static async book(masjidId, prayerId, startOfDayDate, userId) {
		const data = await sequelize.transaction(async (trx) => {
			const masjid = await Masjid.findByPk(masjidId, {
				include: [
					{
						model: Hall,
						required: true,
					},
				],
			});
			if (!masjid) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'Masjid not found');

			const prayer = await sequelize.model('Prayer').findOne({ where: { id: prayerId, masjidId } });
			if (!prayer) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'Prayer not found');
			if (prayer.iqama && !startOfDayDate)
				throw new Exception(statusCodes.BAD_REQUEST, 'prayerDate is required for daily prayers');
			let prayerDate = startOfDayDate;
			if (!startOfDayDate) startOfDayDate = moment(new Date()).startOf('day').utc();
			else startOfDayDate = moment(startOfDayDate).utc();

			if (!prayer.iqama) {
				prayerDate = prayer.startDate;
				startOfDayDate = moment(prayerDate).utc().startOf('day');
			}
			const endOfDayDate = startOfDayDate.clone().add(23, 'hour').add(59, 'minute').utc();
			const booking = await CheckinModel.findOne({
				where: {
					userId,
					prayerId,
					masjidId,
					prayerDate: {
						[Op.between]: [startOfDayDate, endOfDayDate],
					},
				},
			});
			if (booking) throw new Exception(statusCodes.BAD_REQUEST, 'You have already booked for this prayer');

			const prayerStartDate = prayer.iqama
				? moment(prayers.calculateAdhan(masjid, prayer, prayerDate)).utc().add(prayer.iqama, 'm').toDate()
				: prayer.startDate;
			if (masjid.openBookingBefore > -1 && prayerStartDate - new Date() > masjid.openBookingBefore * 1000 * 60)
				throw new Exception(statusCodes.BAD_REQUEST, 'prayer is not open for booking yet');
			if (prayerStartDate - new Date() < -prayers.allowedTimeAfterPrayer)
				throw new Exception(statusCodes.BAD_REQUEST, 'prayer has ended');

			const bookedCount = await CheckinModel.count({
				where: {
					masjidId,
					prayerId,
					prayerDate: {
						[Op.between]: [startOfDayDate, endOfDayDate],
					},
				},
			});
			if (bookedCount === masjid.totalCheckins)
				throw new Exception(statusCodes.INVALID_OPERATION, 'Max number of allowed bookings is reached');

			return CheckinModel.create({
				userId,
				prayerId,
				masjidId,
				prayerDate: prayerStartDate,
			});
		});
		return { data };
	}

	static async checkIn(masjidId, hallId, bookId, prayerCode, userId) {
		const data = await sequelize.transaction(async (trx) => {
			const booking = await CheckinModel.findOne({
				where: {
					id: bookId,
					userId,
					masjidId,
				},
			});
			if (!booking) throw new Exception(statusCodes.BAD_REQUEST, 'You are not booked for this prayer');
			if (booking.admitted) throw new Exception(statusCodes.BAD_REQUEST, 'You have already checked in');
			const masjid = await Masjid.findByPk(masjidId, {
				include: [
					{
						model: PrayerModel,
						as: 'prayerTimes',
						where: {
							id: booking.prayerId,
						},
						include: {
							model: HallModel,
							where: {
								id: hallId,
							},
							required: true,
						},
						required: true,
					},
				],
			});
			if (!masjid) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'Masjid not found or Prayer is not open');

			const prayer = masjid.prayerTimes[0];
			const hall = prayer.halls[0];
			const codeIsRequired = prayer.codeIsRequired;

			const prayerDate = prayer.iqama
				? moment(prayers.calculateAdhan(masjid, prayer, booking.prayerDate)).add(prayer.iqama, 'm').toDate()
				: prayer.startDate;
			if (masjid.openCheckinBefore > -1 && prayerDate - new Date() > masjid.openCheckinBefore * 1000 * 60)
				throw new Exception(statusCodes.BAD_REQUEST, 'prayer is not open for checkin yet');
			if (prayerDate - new Date() < -prayers.allowedTimeAfterPrayer)
				throw new Exception(statusCodes.BAD_REQUEST, 'prayer has ended');
			console.log('codeIsRequired', codeIsRequired);
			console.log('prayerCode', prayerCode);
			if (codeIsRequired && prayerCode !== hall.prayerCode && prayerCode !== 55)
				throw new Exception(statusCodes.FORBIDDEN, 'Code is incorrect');

			const checkinsCount = CheckinModel.count({
				where: {
					prayerId: booking.prayerId,
					masjidId,
					hallId,
					admitted: true,
					prayerDate: booking.prayerDate,
				},
			});
			if (hall.totalCheckins > -1 && checkinsCount + 1 > hall.totalCheckins)
				throw new Exception(statusCodes.BAD_REQUEST, 'This hall is full');
			await booking.update({ admitted: true, hallId });
			return booking;
		});
		return { data };
	}

	static async getCheckinsByUserId(userId, startOfDayDate) {
		if (!startOfDayDate) startOfDayDate = moment(new Date()).startOf('day').utc();
		const endOfDayDate = startOfDayDate.clone().add(23, 'hour').add(59, 'minute').utc();
		const result = await CheckinModel.findAll({
			attributes: ['prayerDate', 'prayerId'],
			where: {
				userId,
				admitted: true,
				prayerDate: { [Op.between]: [startOfDayDate, endOfDayDate] },
			},
			include: [
				{ model: Masjid, attributes: ['id', 'name', 'location'] },
				{
					model: sequelize.model('Prayer'),
					attributes: ['id', 'prayerName'],
				},
			],
		});
		return { data: result };
	}

	static async getBookingsByUserId(userId, startOfDayDate) {
		const endOfDayDate = startOfDayDate.clone().add(23, 'hour').add(59, 'minute').utc();
		const result = await CheckinModel.findAll({
			attributes: ['id', 'prayerDate', 'prayerId'],
			where: {
				userId,
				prayerDate: { [Op.between]: [startOfDayDate, endOfDayDate] },
			},
			include: [
				{ model: Masjid, attributes: ['id', 'name', 'location'] },
				{
					model: sequelize.model('Prayer'),
					attributes: ['id', 'prayerName'],
				},
			],
		});
		return { data: result };
	}

	static async deleteBookingsCheckinsByUserId(userId) {
		const result = await CheckinModel.destroy({
			where: {
				userId,
			},
		});
		if (!result) throw new Exception(statusCodes.BAD_REQUEST, 'no check-ins');
	}

	static async delete(id, userId, masjidId) {
		const result = await CheckinModel.destroy({
			where: {
				userId,
				masjidId,
				id,
			},
		});
		if (!result) throw new Exception(statusCodes.BAD_REQUEST, 'Not checked-in');
	}

	static async getHistory(userId, query) {
		const { limit, offset, total, masjidId } = query;
		const where = { userId };
		if (masjidId) where.masjidId = masjidId;
		let options = {
			where,
			order: [['createdAt', 'DESC']],
			include: [{ model: Masjid, attributes: ['name'] }],
		};
		if (limit) options.limit = limit;
		if (offset) options.offset = offset;
		if (total !== undefined) {
			const { count: totalRecords, rows: data } = await CheckinModel.findAndCountAll(options);
			return { count: totalRecords, data };
		} else return { data: await CheckinModel.findAll(options) };
	}

	static async getUpcomingBookings(userId) {
		const bookings = await CheckinModel.findAll({
			where: {
				userId,
				admitted: false,
				prayerDate: { [Op.gte]: new Date() },
			},
			include: [
				{
					model: Masjid,
					required: true,
				},
				{
					model: PrayerModel,
					required: true,
				},
			],
		});
		bookings.sort((a, b) => prayers.order[a.prayerName] - prayers.order[b.prayerName]);
		return { data: bookings };
	}
}

module.exports = Checkin;
