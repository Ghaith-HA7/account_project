const _ = require('lodash');
const MasjidEvent = require('../services/masjidEvent');
const PaymentModel = require('../../../../payment/models/payment');
const PaymentService = require('../../../../payment/services/payment');
const UserMasjidEvent = require('../services/userMasjidEvent');
const { genUploader } = require('../../../../../utils');
const { statusCodes } = require('usol-utils');
const UserService = require('../../../../user/services/user');

module.exports = {
	/** Add a new masjid event*/
	save: async (req, res) => {
		const data = req.body;
		const assets = res.locals.assets;
		const result = await new MasjidEvent(data).save(req.user, assets);
		res.status(statusCodes.CREATED).json({ msg: 'CREATED', data: result });
	},

	/** register user in event */
	registerUser: async (req, res) => {
		const data = req.body;
		const userId = req.user.id;
		const id = req.params.id;
		const result = await new UserMasjidEvent(data).registerUser(userId, id);
		res.status(statusCodes.CREATED).json({ msg: 'CREATED', data: result });
	},
	/** unregister user from event */
	unregisterUser: async (req, res) => {
		const id = req.params.id;
		const userId = req.user.id;
		await UserMasjidEvent.unregisterUser(userId, id);
		res.sendStatus(statusCodes.DELETED);
	},

	/** add user payment for masjid event */
	pay: async (req, res) => {
		const userId = req.user.id;
		const targetId = req.params.id;
		const FeeData = req.body;
		const data = { ...FeeData, targetId };
		const targetType = PaymentModel.targetTypes.MasjidEvent;
		const result = await PaymentService.splitTransfer(userId, targetType, data);
		res.status(statusCodes.CREATED).json(result);
	},

	/** upload masjid-event file */
	upload: genUploader({
		maxFileSize: 10,
		allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf'],
		directoryName: '/masjid-events',
		fields: [
			{ name: 'image', maxCount: 1 },
			{ name: 'attachment', maxCount: 1 },
		],
	}),

	/** update masjid-event attachment */
	updateAttachment: async (req, res) => {
		const fileUrl = res.locals.assets.file[0].url;
		const { id } = req.params;
		const result = await MasjidEvent.updateAttachment(id, fileUrl);
		res.status(statusCodes.UPDATED).json(result);
	},

	/** Get masjid event by id */
	getById: async (req, res) => {
		const user = req.user;
		const { id } = req.params;
		const result = await MasjidEvent.getById(user, id);
		res.status(statusCodes.OK).json(result);
	},

	/** Get list of masjid events */
	getList: async (req, res) => {
		const query = req.query;
		const user = req.user;
		const result = await MasjidEvent.getList(user, query);
		res.status(statusCodes.OK).json(result);
	},

	/** share event */
	share: async (req, res) => {
		const id = req.params.id;
		const data = await MasjidEvent.share(id);
		res.status(statusCodes.CREATED).json({ msg: 'CREATED', data });
	},

	/** share event */
	getShareCount: async (req, res) => {
		const id = req.params.id;
		const data = await MasjidEvent.getShareCount(id);
		res.status(statusCodes.OK).json({ msg: 'OK', data });
	},

	saveInterest: async (req, res) => {
		const id = req.params.id;
		const userId = req.user.id;
		const result = await UserService.saveUserInterest(userId, id, 'MasjidEvent');
		res.status(statusCodes.CREATED).json(result);
	},

	deleteInterest: async (req, res) => {
		const id = req.params.id;
		const userId = req.user.id;
		await UserService.deleteUserInterest(userId, id, 'MasjidEvent');
		res.sendStatus(statusCodes.DELETED);
	},
};
