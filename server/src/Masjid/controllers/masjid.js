const _ = require('lodash');
const MasjidService = require('../services/masjid');
const PaymentModel = require('../../payment/models/payment');
const PaymentService = require('../../payment/services/payment');
const CheckinService = require('../services/checkin');
const { statusCodes } = require('usol-utils');

module.exports = {
	/** Add a new masjid */
	save: async (req, res) => {
		const data = req.body;
		const { adminId } = req.body;
		const result = await new MasjidService(data).save(adminId);
		res.status(statusCodes.CREATED).json(result);
	},

	/** Add a new custom prayer */
	saveCustomPrayer: async (req, res) => {
		const data = req.body;
		const { id } = req.params;
		const result = await MasjidService.saveCustomPrayers(id, data);
		res.status(statusCodes.CREATED).json(result);
	},

	/** Add a new masjid donation */
	donate: async (req, res) => {
		const userId = req.user.id;
		const targetId = req.params.id;
		const FeeData = req.body;
		const data = { ...FeeData, targetId };
		const targetType = PaymentModel.targetTypes.Masjid;
		const result = await PaymentService.splitTransfer(userId, targetType, data);
		res.status(statusCodes.CREATED).json(result);
	},

	/** update masjid */
	update: async (req, res) => {
		const { id } = req.params;
		const data = req.body;
		await new MasjidService(data).update(id);
		res.sendStatus(statusCodes.UPDATED);
	},

	/** update custom prayer */
	updateCustomPrayer: async (req, res) => {
		const { id, prayerId } = req.params;
		const data = req.body;
		await MasjidService.updateCustomPrayers(id, prayerId, data);
		res.sendStatus(statusCodes.UPDATED);
	},

	/** update prayer halls */
	updateDailyPrayer: async (req, res) => {
		const { id, prayerId } = req.params;
		const data = req.body;
		await MasjidService.updateDailyPrayer(id, prayerId, data);
		res.sendStatus(statusCodes.UPDATED);
	},

	followMasjid: async (req, res) => {
		const userId = req.user.id;
		const masjidId = req.params.id;
		await MasjidService.followMasjid(userId, masjidId);
		res.sendStatus(statusCodes.CREATED);
	},

	unFollowMasjid: async (req, res) => {
		const userId = req.user.id;
		const masjidId = req.params.id;
		await MasjidService.unFollowMasjid(userId, masjidId);
		res.sendStatus(statusCodes.DELETED);
	},

	delete: async (req, res) => {
		const { id } = req.params;
		const result = await MasjidService.delete(id);
		res.status(statusCodes.DELETED).json(result);
	},

	/** delete custom prayer */
	deleteCustomPrayer: async (req, res) => {
		const { id, prayerId } = req.params;
		const result = await MasjidService.deleteCustomPrayer(id, prayerId);
		res.status(statusCodes.DELETED).json(result);
	},

	/** Get masjid by id */
	getById: async (req, res) => {
		const masjidId = req.params.id;
		const { date } = req.query;
		const result = await MasjidService.getById(req.user, masjidId, date);
		res.status(statusCodes.OK).json(result);
	},

	/** Get All masjids */
	getList: async (req, res) => {
		const pagination = _.pick(req.query, ['limit', 'offset']);
		const userId = req.user && req.user.id ? req.user.id : null;
		const result = await MasjidService.getList(userId, pagination);
		res.status(statusCodes.OK).json(result);
	},

	getMyCheckins: async (req, res) => {
		const userId = req.user.id;
		const result = await CheckinService.getCheckinsByUserId(userId);
		res.status(statusCodes.OK).json(result);
	},

	restrictToMasjidAdmin: async (req, res, next) => {
		const user = req.user;
		const masjidId = req.params.id;
		res.locals.masjid = await MasjidService.restrictToMasjidAdmin(user, masjidId);
		next();
	},
};
