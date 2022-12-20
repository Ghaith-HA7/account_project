const { statusCodes, Exception } = require('usol-utils');
const { genUploader } = require('../../../utils');
const UserService = require('../services/user');
const PaymentService = require('../../payment/services/payment');
const UserSymptomService = require('../services/userSymptom');

module.exports = {
	create: async (req, res) => {
		const data = req.body;
		const user = await new UserService(data).createUser();
		res.status(statusCodes.CREATED).send({ msg: 'CREATED', data: user });
	},
	createSymptoms: async (req, res) => {
		const userId = req.user.id;
		const symptoms = req.body.symptoms;
		const userSymptoms = await UserSymptomService.create(userId, symptoms);
		res.status(statusCodes.CREATED).send({ msg: 'CREATED', data: userSymptoms });
	},
	update: async (req, res) => {
		const user = req.user;
		const data = req.body;
		const updatedUser = await new UserService(data).updateUser(user);
		res.status(statusCodes.UPDATED).send({ msg: 'UPDATED', data: updatedUser });
	},
	updateById: async (req, res) => {
		const userId = req.params.id;
		const data = req.body;
		const updatedUser = await new UserService(data).updateUserById(userId);
		res.status(statusCodes.UPDATED).send({ msg: 'UPDATED', data: updatedUser });
	},
	status: async (req, res) => {
		const userId = req.user.id;
		const data = await UserService.getUserStatus(userId);
		res.status(statusCodes.OK).send({ msg: 'OK', data });
	},
	getInfo: async (req, res) => {
		const userId = req.user.id;
		const data = await UserService.getInfo(userId);
		res.status(statusCodes.OK).send({ msg: 'OK', data });
	},

	getById: async (req, res) => {
		const userId = req.params.id;
		const data = await UserService.getInfo(userId);
		res.status(statusCodes.OK).send({ msg: 'OK', data });
	},

	delete: async (req, res) => {
		const userId = req.user.id;
		await UserService.deleteUser(userId);
		res.sendStatus(statusCodes.DELETED);
	},

	deleteById: async (req, res) => {
		const userId = req.params.id;
		await UserService.deleteUser(userId);
		res.sendStatus(statusCodes.DELETED);
	},

	updateImage: async (req, res) => {
		const userId = req.user.id;
		const assets = res.locals.assets;
		const data = await UserService.updateImage(assets, userId);
		res.status(statusCodes.UPDATED).send(data);
	},
	uploadProfileImage: genUploader({
		fields: [{ name: 'file', maxCount: 1 }],
		maxFileSize: 5,
		allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif'],
		directoryName: '/user/profile-images',
	}),
	canTakeActions: async (req, res, next) => {
		const { banned } = await UserService.getUserStatus(req.user.id);
		if (banned) throw new Exception(statusCodes.FORBIDDEN, "Can't take actions");
		else next();
	},
	getList: async (req, res) => {
		const pagination = _.pick(req.query, ['limit', 'offset']);
		const result = await UserService.getList(pagination);
		res.status(statusCodes.OK).json(result);
	},

	/** Get payments for users */
	getUserPayments: async (req, res) => {
		const pagination = _.pick(req.query, ['limit', 'offset']);
		const criteria = _.pick(req.query, ['userId', 'targetType', 'targetId', 'confirmed', 'createdAt']);
		const result = await PaymentService.getUserPayments(criteria, pagination);
		res.status(statusCodes.OK).json(result);
	},

	/** Get user prayers, occasions and hijri date over their own location time zone */
	getUserPrayersAndOccasions: async (req, res) => {
		const userId = req.user.id;
		const result = await UserService.getUserPrayersAndOccasions(userId);
		res.status(statusCodes.OK).json(result);
	},
};
