const _ = require('lodash');
const GivingService = require('../services/giving');
const PaymentModel = require('../../../../payment/models/payment');
const PaymentService = require('../../../../payment/services/payment');
const { statusCodes } = require('usol-utils');
const { genUploader } = require('../../../../../utils');
const UserService = require('../../../../user/services/user');

module.exports = {
	/** Add a new giving */
	save: async (req, res) => {
		const data = req.body;
		const userId = req.user.id;
		const img = res.locals.assets;
		const result = await new GivingService(data).save(userId, img);
		res.status(statusCodes.CREATED).json(result);
	},

	/** add user donation */
	donate: async (req, res) => {
		const userId = req.user.id;
		const targetId = req.params.id;
		const FeeData = req.body;
		const data = { ...FeeData, targetId };
		const targetType = PaymentModel.targetTypes.Giving;
		const result = await PaymentService.splitTransfer(userId, targetType, data);
		res.status(statusCodes.CREATED).json(result);
	},

	/** Add a new user interest in giving  */
	saveInterest: async (req, res) => {
		const givingId = req.params.id;
		const userId = req.user.id;
		const result = await UserService.saveUserInterest(userId, givingId, 'Giving');
		res.status(statusCodes.CREATED).json(result);
	},

	/** Add a new user share */
	saveShare: async (req, res) => {
		const givingId = req.params.id;
		const userId = req.user.id;
		const result = await GivingService.saveUserShare(userId, givingId);
		res.status(statusCodes.CREATED).json(result);
	},

	/** Update a new giving */
	update: async (req, res) => {
		const data = req.body;
		const { id } = req.params;
		const user = req.user;
		const result = await new GivingService(data).update(id, user);
		res.status(statusCodes.UPDATED).json(result);
	},

	/** upload giving image file */
	uploader: genUploader({
		fields: [{ name: 'file', maxCount: 1 }],
		maxFileSize: 5,
		allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif'],
		directoryName: '/givings',
	}),

	/** update giving image file */
	updateImage: async (req, res) => {
		const img = res.locals.assets;
		const { id } = req.params;
		const user = req.user;
		const result = await GivingService.updateAttachment(id, user, img);
		res.status(statusCodes.UPDATED).json(result);
	},

	/** delete giving */
	delete: async (req, res) => {
		const { id } = req.params;
		const user = req.user;
		await GivingService.delete(id, user);
		res.sendStatus(statusCodes.DELETED);
	},

	/** delete user interest */
	deleteInterest: async (req, res) => {
		const id = req.params.id;
		const userId = req.user.id;
		await UserService.deleteUserInterest(userId, id, 'Giving');
		res.sendStatus(statusCodes.DELETED);
	},

	/** delete user share */
	deleteShare: async (req, res) => {
		const id = req.params.id;
		const userId = req.user.id;
		await GivingService.deleteUserShare(id, userId);
		res.sendStatus(statusCodes.DELETED);
	},

	/** get giving by id*/
	getById: async (req, res) => {
		const { id } = req.params;
		const user = req.user;
		const result = await GivingService.getById(user, id);
		res.status(statusCodes.OK).json(result);
	},

	/** get list of givings */
	getList: async (req, res) => {
		const pagination = _.pick(req.query, ['limit', 'offset']);
		const filters = req.query;
		const user = req.user;
		const result = await GivingService.getList(user, pagination, filters);
		res.status(statusCodes.OK).json(result);
	},
};
