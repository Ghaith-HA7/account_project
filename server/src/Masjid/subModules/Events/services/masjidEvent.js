const MasjidEventModel = require('../models/masjidEvent');
const MasjidModel = require('../../../models/masjid');
const UserMasjidEventModel = require('../models/userMasjidEvent');
const MasjidEventShare = require('../models/masjidEventShare');
const User = require('../../../../user/models/user');
const { Op } = require('sequelize');
const path = require('path');
const moment = require('moment');
const {
	Exception,
	statusCodes,
	database: { sequelize, Sequelize },
} = require('usol-utils');
const Roles = require('../../../../../utils/Roles');
const UserInterest = require('../../../../user/models/userInterest');
const Payment = require('../../../../payment/models/payment');

class MasjidEvent {
	constructor(data) {
		this.category = data.category;
		this.title = data.title;
		this.description = data.description;
		this.lat = data.lat;
		this.lng = data.lng;
		this.location = data.location;
		this.sheikhName = data.sheikhName;
		this.fee = data.fee;
		this.startDate = data.startDate;
		this.endDate = data.endDate;
		this.total = data.total;
		this.dailyRenew = data.dailyRenew;
		this.img = data.img;
		this.attachmentUrl = data.attachmentUrl;
		this.masjidId = data.masjidId;
	}

	async save(user, assets) {
		let userId = user.id;
		if (user.role === Roles.user && this.masjidId) throw new Exception(statusCodes.UNAUTHORIZED);
		if (user.role === Roles.admin && this.masjidId) {
			let masjid = await MasjidModel.findOne({ where: { adminId: userId } });
			if (this.masjidId !== masjid.id) throw new Exception(statusCodes.UNAUTHORIZED);
			userId = masjid.adminId;
		}
		const category = await sequelize.model('Category').findByPk(this.category);
		if (!category) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'category not found');
		if (assets) {
			if (assets.image && assets.image.length) this.img = assets.image[0].url;
			if (assets.attachment && assets.attachment.length) this.attachmentUrl = assets.attachment[0].url;
		}
		return await MasjidEventModel.create({ ...this, ownerId: userId });
	}

	static async updateAttachment(id, fileUrl) {
		const event = await MasjidEventModel.findByPk(id);
		if (!event) throw new Exception(statusCodes.ITEM_NOT_FOUND);
		let url = event.attachmentUrl;
		if (url !== null) {
			let attachPath = path.join('assets', 'public', url);
			if (require('fs').existsSync(attachPath)) await fs.unlink(attachPath);
		}
		const asset = await MasjidEventModel.update(
			{ attachmentUrl: fileUrl },
			{
				where: {
					id,
				},
			}
		);
		return asset;
	}

	static async getById(user, id) {
		const event = await MasjidEventModel.findByPk(id, {
			include: [
				{
					model: MasjidModel,
					attributes: ['name', 'lat', 'lng'],
				},
			],
		});
		if (!event) throw new Exception(statusCodes.ITEM_NOT_FOUND);
		const going = !event.fee
			? await UserMasjidEventModel.count({ where: { masjidEventId: id } })
			: await Payment.count({
					where: { targetId: id, targetType: Payment.targetTypes.MasjidEvent, confirmed: true },
			  });
		const interested = await UserInterest.count({
			where: { targetId: id, targetType: UserInterest.targetTypes.MasjidEvent },
		});
		const result = { going, interested, ...event.toJSON() };
		if (user) {
			result.isGoing = !!(await UserMasjidEventModel.findOne({ where: { userId: user.id, masjidEventId: id } }));
			result.isPaymentConfirmed =
				result.isGoing &&
				(!event.fee ||
					(await Payment.findOne({
						where: {
							userId: user.id,
							targetId: id,
							targetType: Payment.targetTypes.MasjidEvent,
							confirmed: true,
						},
					})));
			result.isInterested = !!(await UserInterest.findOne({
				where: { targetId: id, targetType: UserInterest.targetTypes.MasjidEvent, userId: user.id },
			}));
		}
		return { data: result };
	}

	static async getList(user, query) {
		const { limit, offset, category, masjidId, lat, lng, startDate, endDate, date } = query;
		let where = {
			endDate: {
				[Op.gt]: new Date(),
			},
		};
		if (masjidId) where.masjidId = masjidId;
		if (category) where.category = category;
		if (startDate && endDate) {
			where[Op.or] = {
				startDate: { [Op.and]: { [Op.gte]: startDate, [Op.lte]: endDate } },
				endDate: { [Op.and]: { [Op.gte]: startDate, [Op.lte]: endDate } },
			};
		} else if (date) {
			where[Op.and] = {
				startDate: { [Op.lte]: date },
				endDate: { [Op.gte]: date },
			};
		}
		let options = {
			where,
			include: [
				{
					model: MasjidModel,
					attributes: ['name'],
				},
			],
			limit,
			offset,
			order: [['createdAt', 'DESC']],
		};
		if (lat && lng) {
			options.attributes = [
				[
					Sequelize.literal(`SQRT(
						POW(111.2 * (MasjidEvent.lat - ${lat}), 2) +
						POW(111.2 * (${lng} - MasjidEvent.lng) * COS(MasjidEvent.lat / 57.3), 2))`),
					'distance',
				],
				'attachmentUrl',
				'id',
				'category',
				'title',
				'lat',
				'lng',
				'location',
				'description',
				'sheikhName',
				'fee',
				'startDate',
				'endDate',
				'img',
				'total',
				'createdAt',
				'masjidId',
			];
			options.where = {
				[Op.and]: [
					where,
					Sequelize.where(
						Sequelize.literal(`SQRT(
							POW(111.2 * (MasjidEvent.lat - ${lat}), 2) +
							POW(111.2 * (${lng} - MasjidEvent.lng) * COS(MasjidEvent.lat / 57.3), 2))`),
						'<=',
						'1000'
					),
				],
			};
			options.order = [[Sequelize.literal('distance'), 'ASC']];
		}

		if (user) {
			options.include.push(
				{
					model: UserInterest,
					where: { userId: user.id },
					required: false,
					as: 'interests',
				},
				{
					model: User,
					where: { id: user.id },
					required: false,
					as: 'goingUsers',
				}
			);
		}
		options.distinct = true;
		const { count: totalRecords, rows: data } = await MasjidEventModel.findAndCountAll(options);
		let result = { totalRecords };
		result.data = data.map((row) => {
			const newRow = { ...row.toJSON() };
			newRow.isGoing = row.goingUsers && row.goingUsers.length;
			newRow.isInterested = row.interests && row.interests.length;
			delete newRow.goingUsers;
			delete newRow.interests;
			return newRow;
		});

		//providing a calendar object
		if (startDate && endDate) {
			let calendar = {};
			let start = removeTime(startDate);
			let end = removeTime(endDate);
			for (let d = start; d <= end; d.date(d.date() + 1)) {
				calendar[d.format('YYYY-MM-DD')] = false;
			}
			result.data.forEach((event) => {
				let start = removeTime(event.startDate);
				let end = removeTime(event.endDate);
				let filter = {
					start: removeTime(startDate),
					end: removeTime(endDate),
				};
				for (let d = start; d <= end; d.date(d.date() + 1)) {
					if (d >= filter.start && d <= filter.end) calendar[d.format('YYYY-MM-DD')] = true;
				}
			});
			result.calendar = [];
			for (const [key, value] of Object.entries(calendar)) {
				result.calendar.push({ date: key, event: value });
			}
		}
		return result;
	}

	static async share(id) {
		const event = await MasjidEventModel.findByPk(id);
		if (!event) throw new Exception(statusCodes.ITEM_NOT_FOUND);
		return await MasjidEventShare.create({ masjidEventId: id });
	}

	static async getShareCount(id) {
		return await MasjidEventShare.count({ masjidEventId: id });
	}
}

const removeTime = (date) => {
	let d = moment(date);
	return moment({ year: d.year(), month: d.month(), date: d.date(), hours: 0 });
};

module.exports = MasjidEvent;
