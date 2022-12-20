const { Op } = require('sequelize');
const moment = require('moment');
const HallModel = require('../models/hall');
const CheckinService = require('./checkin');
const {
	Exception,
	statusCodes,
	database: { sequelize },
} = require('usol-utils');
const { codeGenerator } = require('../../../utils/index');
const Prayer = require('../models/prayer');
class Hall {
	constructor(data) {
		this.totalCheckins = data.totalCheckins;
	}

	async save(masjidId) {
		let hall = await HallModel.create({ ...this, masjidId });
		return { data: { id: hall.id } };
	}

	async update(id) {
		const data = await sequelize.transaction(async (trx) => {
			const hall = await HallModel.findByPk(id);
			if (!hall) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			return hall.update({ ...this });
		});
		return { data };
	}

	static async delete(id) {
		await sequelize.transaction(async (trx) => {
			const hall = await HallModel.findByPk(id);
			if (!hall) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			await hall.destroy();
		});
	}

	static async getMasjidHalls(user, masjidId, query) {
		// date: is start of client's day date
		const { limit, offset, prayerId, date } = query;
		const startOfDayDate = new moment(date);
		const endOfDayDate = startOfDayDate.clone().add(23, 'hour').add(59, 'minute').utc();
		const prayer = await Prayer.findOne({
			where: { id: prayerId, masjidId },
			include: {
				model: sequelize.model('Masjid'),
				attributes: ['adminId'],
			},
		});
		if (!prayer) throw new Exception(statusCodes.ITEM_NOT_FOUND);
		if (prayer.iqama && !date) throw new Exception(statusCodes.BAD_REQUEST, 'date is required for daily prayers');

		const totalRecords = await HallModel.count({
			where: { masjidId, prayerId },
		});

		const halls = await HallModel.findAll({
			attributes: {
				include: [[sequelize.fn('COUNT', sequelize.col('checkins.id')), 'checkinsCount']],
				exclude:
					user && ((user.role === 'admin' && prayer.Masjid.adminId === user.id) || user.role === 'superAdmin')
						? []
						: ['prayerCode'],
			},
			where: { masjidId, prayerId },
			offset,
			limit,
			include: [
				{
					model: sequelize.model('Checkin'),
					as: 'checkins',
					where: {
						prayerDate: {
							[Op.between]: [startOfDayDate, endOfDayDate],
						},
					},
					attributes: [],
					required: false,
				},
			],
			group: ['id'],
			raw: true,
		});

		return { totalRecords, data: halls };
	}

	static async generateCode(masjidId, hallId, prayerId) {
		const data = await sequelize.transaction(async (trx) => {
			const prayer = await Prayer.findOne({
				where: {
					id: prayerId,
					masjidId,
				},
				include: {
					model: HallModel,
				},
			});
			if (!prayer) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'prayer not found');
			const halls = prayer.halls;
			const oldCodes = halls.map((hall) => hall.prayerCode);
			await prayer.update({ codeIsRequired: true });
			if (hallId) {
				const prayerCode = codeGenerator({ digits: 2, exclude: oldCodes });
				const hall = halls.find((hall) => hall.id === hallId);
				if (!hall) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'hall not found');
				await hall.update({ prayerCode });
				return hall;
			} else {
				const codes = codeGenerator({ digits: 2, count: halls.length, exclude: oldCodes });
				return Promise.all(
					halls.map(async (hall, i) => {
						await hall.update({ prayerCode: Array.isArray(codes) ? codes[i] : codes });
						return hall;
					})
				);
			}
		});
		return { data };
	}

	static async removeCode(masjidId, hallId, prayerId) {
		const data = await sequelize.transaction(async (trx) => {
			const prayer = await Prayer.findOne({ where: { id: prayerId, masjidId } });
			if (!prayer) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			await prayer.update({ codeIsRequired: false });
			const where = hallId ? { id: hallId, prayerId, masjidId } : { prayerId, masjidId };
			return await HallModel.update({ prayerCode: null }, { where });
		});
		return { data };
	}
}

module.exports = Hall;
