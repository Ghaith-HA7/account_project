const MasjidModel = require('../models/masjid');
const PrayerModel = require('../models/prayer');
const HallModel = require('../models/hall');
const UserService = require('../../user/services/user');
const CheckinService = require('../services/checkin');
const {
	Exception,
	statusCodes,
	database: { sequelize },
} = require('usol-utils');
const { prayers, Roles } = require('../../../utils');
const _ = require('lodash');

const { Op } = require('sequelize');
const moment = require('moment');
class Masjid {
	constructor(data) {
		this.name = data.name;
		this.customId = data.customId;
		this.location = data.location;
		this.lat = data.lat;
		this.lng = data.lng;
		this.img = data.img;
		this.coverImg = data.coverImg;
		this.method = data.method;
		this.madhab = data.madhab;
		this.openCheckinBefore = data.openCheckinBefore;
		this.openBookingBefore = data.openBookingBefore;
		this.totalCheckins = data.totalCheckins;
		this.prayerTimes =
			(data.prayerTimes &&
				data.prayerTimes.map((pTime) => ({
					codeIsRequired: true,
					prayerName: pTime.prayerName,
					iqama: pTime.iqama,
				}))) ||
			null;
	}

	async save(adminId) {
		let masjid = await sequelize.transaction(async (trx) => {
			let masjid = await MasjidModel.create(
				{ ...this, adminId }
				// { include: { model: PrayerModel, as: 'prayerTimes' } }
			);
			if (!masjid) throw new Exception(statusCodes.ITEM_NOT_FOUND);

			if (this.prayerTimes) {
				const visited = {};
				let prayerTimes = [];
				for (const prayer of this.prayerTimes) {
					if (visited[prayer.prayerName]) continue;
					visited[prayer.prayerName] = true;
					prayerTimes.push(prayer);
				}
				prayerTimes = prayerTimes.map((pTime) => ({
					...pTime,
					masjidId: masjid.id,
					halls: [
						{
							prayerCode: Math.floor(Math.random() * (100 - 10) + 10),
							totalCheckins: this.totalCheckins,
							masjidId: masjid.id,
							daily: true,
						},
					],
				}));
				await PrayerModel.bulkCreate(prayerTimes, {
					include: {
						model: HallModel,
					},
				});
			}
			return masjid;
		});

		return { data: { id: masjid.id } };
	}

	async update(id) {
		return await sequelize.transaction(async (trx) => {
			let masjid = await MasjidModel.findByPk(id);
			if (!masjid) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			await masjid.update(this);
			await HallModel.update(
				{ totalCheckins: this.totalCheckins },
				{
					where: {
						masjidId: id,
						daily: true,
					},
				}
			);
			if (this.prayerTimes) {
				await Promise.all(
					this.prayerTimes.map(async (pTime) => {
						// check if prayer is existed to update or create new one
						const prayer = await PrayerModel.findOne({
							where: { masjidId: id, prayerName: pTime.prayerName },
							include: HallModel,
						});
						if (prayer) {
							if (prayer.halls.length) await prayer.update({ iqama: pTime.iqama });
							// create new hall for this prayer
							else
								await prayer.update(
									{
										iqama: pTime.iqama,
										halls: [
											{ totalCheckins: masjid.totalCheckins, masjidId: masjid.id, daily: true },
										],
									},
									{ include: HallModel }
								);
						} else {
							await PrayerModel.create(
								{
									...pTime,
									masjidId: id,
									halls: [{ totalCheckins: masjid.totalCheckins, masjidId: masjid.id, daily: true }],
								},
								{ include: HallModel }
							);
						}
					})
				);
			}
		});
	}

	static async saveCustomPrayers(masjidId, { prayerName, hallsTotals = [], startDate }) {
		const halls = hallsTotals.map((total) => ({
			prayerCode: Math.floor(Math.random() * (100 - 10) + 10),
			totalCheckins: total,
			masjidId,
		}));
		const customPrayer = await PrayerModel.create(
			{ prayerName, codeIsRequired: true, startDate, masjidId, halls },
			{ include: HallModel }
		);
		if (!customPrayer) throw new Exception(statusCodes.ITEM_NOT_FOUND);

		return { data: { id: customPrayer.id } };
	}

	static async updateCustomPrayers(masjidId, prayerId, { prayerName, hallsTotals, startDate }) {
		await sequelize.transaction(async (trx) => {
			const customPrayer = await PrayerModel.findOne({ where: { id: prayerId, masjidId } });
			if (!customPrayer) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			const data = _.omitBy(
				{
					prayerName,
					startDate,
				},
				_.isUndefined
			);
			await customPrayer.update({ ...data });

			if (hallsTotals) {
				const halls = hallsTotals.map((total) => ({ totalCheckins: total, masjidId, prayerId }));
				await HallModel.destroy({ where: { prayerId, masjidId } });
				await HallModel.bulkCreate(halls);
			}
		});
	}

	static async updateDailyPrayer(masjidId, prayerId, { iqama, totalCheckins }) {
		const prayer = await PrayerModel.findOne({ where: { id: prayerId, masjidId } });
		if (!prayer || !prayer.iqama) throw new Exception(statusCodes.ITEM_NOT_FOUND);
		if (iqama) {
			if (prayers.names.includes(prayer.prayerName)) {
				await prayer.update({ iqama });
			}
		}
		if (totalCheckins) {
			const hall = await HallModel.findOne({ where: { prayerId: prayer.id, masjidId } });
			if (hall) await hall.update({ totalCheckins });
			else await prayer.createHall({ totalCheckins, masjidId, daily: true });
		}
	}

	static async deleteCustomPrayer(masjidId, prayerId) {
		const customPrayer = await PrayerModel.findOne({ where: { id: prayerId, masjidId } });
		if (!customPrayer) throw new Exception(statusCodes.ITEM_NOT_FOUND);
		await customPrayer.destroy();
	}

	static async followMasjid(userId, masjidId) {
		const masjid = await MasjidModel.findByPk(masjidId);
		if (!masjid) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'masjid not found!');
		const user = await UserService.findById(userId);
		return await user.addFollowedMasjid(masjid);
	}

	static async unFollowMasjid(userId, masjidId) {
		const masjid = await MasjidModel.findByPk(masjidId);
		if (!masjid) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'masjid not found!');
		const user = await UserService.findById(userId);
		if (!(await user.hasFollowedMasjid(masjid)))
			throw new Exception(statusCodes.BAD_REQUEST, 'masjid not in the follows list');
		return await user.removeFollowedMasjid(masjid);
	}

	static async delete(id) {
		await sequelize.transaction(async (trx) => {
			const masjid = await MasjidModel.findByPk(id);
			if (!masjid) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			await masjid.destroy();
		});
	}

	static async getById(user, masjidId, startOfDayDate) {
		if (!startOfDayDate) startOfDayDate = moment(new Date()).startOf('day').utc();
		else startOfDayDate = moment(startOfDayDate).utc();
		const endOfDayDate = startOfDayDate.clone().add(23, 'hour').add(59, 'minute').utc();
		const userId = (user && user.id) || null;
		const masjid = await MasjidModel.findOne({
			where: {
				id: masjidId,
			},
			include: [
				{ model: sequelize.model('User'), as: 'follower', where: { id: userId }, required: false },
				{
					model: sequelize.model('MasjidEvent'),
					as: 'events',
					where: { startDate: { [Op.lte]: startOfDayDate }, endDate: { [Op.gte]: endOfDayDate } },
					required: false,
				},
			],
		});

		if (!masjid) throw new Exception(statusCodes.ITEM_NOT_FOUND);
		const upcomingEvents = await sequelize
			.model('MasjidEvent')
			.findAll({ where: { masjidId, endDate: { [Op.gte]: new Date() } }, order: ['startDate'], limit: 10 });
		let masjidPrayerTimesInclude = [
			{
				model: sequelize.model('Checkin'),
				as: 'checkins',
				where: {
					prayerDate: { [Op.between]: [startOfDayDate, endOfDayDate] },
				},
				attributes: [],
				required: false,
			},
		];
		const isAdmin =
			user && (user.role === Roles.superAdmin || (user.role === Roles.admin && masjid.adminId === userId));
		// if (isAdmin) masjidPrayerTimesInclude.push({ model: sequelize.model('Hall') });
		let Halls;
		let masjidHalls;
		if (isAdmin) {
			Halls = await HallModel.findAll({
				where: {
					masjidId,
				},
			});

			masjidHalls = Halls.reduce((acc, curr) => {
				acc[curr.prayerId] = acc[curr.prayerId] || [];
				acc[curr.prayerId].push(curr);
				return acc;
			}, {});
		}

		const masjidPrayerTimes = await sequelize.model('Prayer').findAll({
			where: {
				[Op.or]: [
					{ iqama: { [Op.ne]: null } },
					{ startDate: { [Op.between]: [startOfDayDate, endOfDayDate] } },
				],
				masjidId,
			},
			attributes: [
				'id',
				'prayerName',
				'iqama',
				'codeIsRequired',
				'startDate',
				[sequelize.fn('COUNT', sequelize.col('checkins.id')), 'bookingsCount'],
			],
			// raw: true,
			group: ['id'],
			include: masjidPrayerTimesInclude,
		});

		const { data: userBookings } = await CheckinService.getBookingsByUserId(userId, startOfDayDate);
		const { data: userCheckins } = await CheckinService.getCheckinsByUserId(userId, startOfDayDate);

		const { follower, ...result } = masjid.toJSON();

		result.followed = follower.length !== 0;
		result.dailyPrayers = {};
		result.customPrayers = {};
		for (const row of masjidPrayerTimes) {
			const { id, prayerName, ...prayerData } = row.toJSON();
			if (isAdmin) {
				prayerData.halls = masjidHalls[id];
				prayerData.halls = prayerData.halls
					? prayerData.halls.map((val) => {
							if (val && val.prayerCode === null) val.prayerCode = 55;
							return val;
					  })
					: [];
			}

			if (row.iqama)
				result.dailyPrayers[prayerName] = {
					id,
					prayerName,
					...prayerData,
					bookedIn: false,
					generalBookedIn: false,
					checkedIn: false,
					generalCheckedIn: false,
				};
			else result.customPrayers[id] = { id, prayerName, ...prayerData, bookedIn: false, checkedIn: false };
		}
		for (const booking of userBookings) {
			if (!booking.Prayer || !booking.Masjid) continue;
			if (result.dailyPrayers[booking.Prayer.prayerName]) {
				result.dailyPrayers[booking.Prayer.prayerName].generalBookedIn = true;
				result.dailyPrayers[booking.Prayer.prayerName].bookedIn = booking.Masjid.id === masjid.id;
				result.dailyPrayers[booking.Prayer.prayerName].bookId =
					(booking.Masjid.id === masjid.id && booking.id) || undefined;
			} else if (result.customPrayers[booking.Prayer.id]) {
				result.customPrayers[booking.Prayer.id].generalBookedIn = true;
				result.customPrayers[booking.Prayer.id].bookedIn = true;
				result.customPrayers[booking.Prayer.id].bookId = booking.id;
			}
		}
		for (const checkin of userCheckins) {
			if (!checkin.Prayer || !checkin.Masjid) continue;
			if (result.dailyPrayers[checkin.Prayer.prayerName]) {
				result.dailyPrayers[checkin.Prayer.prayerName].generalCheckedIn = true;
				result.dailyPrayers[checkin.Prayer.prayerName].checkedIn = checkin.Masjid.id === masjid.id;
			} else if (result.customPrayers[checkin.Prayer.id]) {
				result.customPrayers[checkin.Prayer.id].generalCheckedIn = true;
				result.customPrayers[checkin.Prayer.id].checkedIn = true;
			}
		}
		result.prayers = [...Object.values(result.dailyPrayers), ...Object.values(result.customPrayers)];
		result.upcomingEvents = upcomingEvents;
		delete result.dailyPrayers;
		delete result.customPrayers;

		return { data: result };
	}

	static async getList(userId, { limit, offset }) {
		const { count: totalRecords, rows: masjids } = await MasjidModel.findAndCountAll({
			include: userId
				? {
						model: sequelize.model('User'),
						as: 'follower',
						where: { id: userId },
						required: false,
				  }
				: undefined,
			offset,
			limit,
		});
		const data = userId
			? masjids.map((masjid) => {
					const { follower, ...result } = masjid.toJSON();
					result.followed = follower.length !== 0;
					return result;
			  })
			: masjids;
		return { totalRecords, data };
	}

	static async restrictToMasjidAdmin(user, masjidId) {
		if (user.role === Roles.superAdmin) return;
		const masjid = await MasjidModel.findByPk(masjidId);
		if (!masjid) throw new Exception(statusCodes.ITEM_NOT_FOUND, `Masjid with id: ${masjidId} was not found`);
		if (masjid.adminId !== user.id)
			throw new Exception(statusCodes.FORBIDDEN, "You don't have permission to perform this action");
		return masjid;
	}
}

module.exports = Masjid;
