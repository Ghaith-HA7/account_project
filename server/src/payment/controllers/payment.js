const _ = require('lodash');
const PaymentService = require('../services/payment');
const StripeService = require('../middlewares/stripe');
const { statusCodes } = require('usol-utils');
const { Result } = require('express-validator');

module.exports = {
	/** link stripe account */
	linkAccount: async (req, res) => {
		const user = req.user;
		const targetUserId = req.query.userId;
		const data = req.body;
		const result = await PaymentService.linkAccount(user, targetUserId, data);
		res.status(statusCodes.CREATED).json(result);
	},

	/** unlink stripe account */
	unlinkAccount: async (req, res) => {
		const user = req.user;
		const targetUserId = req.query.userId;
		const data = req.body;
		const result = await PaymentService.unlinkAccount(user, targetUserId, data);
		res.status(statusCodes.DELETED).json(result);
	},

	/** set stripe mode (test, live) */
	setStripeMode: async (req, res) => {
		const data = req.query.mode;
		const result = await PaymentService.setStripeMode(data);
		res.status(statusCodes.CREATED).json(result);
	},

	/** set default application fee at payment settings */
	setDefaultFee: async (req, res) => {
		const data = req.body;
		const result = await PaymentService.setDefaultAppFee(data);
		res.status(statusCodes.CREATED).json(result);
	},

	/** set application fee */
	setAppFee: async (req, res) => {
		const targetId = req.query.targetId;
		const data = req.body;
		const result = await PaymentService.setAppFee(targetId, data);
		res.status(statusCodes.CREATED).json(result);
	},

	/** webhook to get the account updates */
	eventWebook: async (req, res) => {
		const eventData = req.body;
		const result = await PaymentService.eventWebhook(eventData);
		res.status(statusCodes.OK).json(result);
	},

	/** get stripe mode ( test, live) */
	getStripeMode: async (req, res) => {
		const result = await PaymentService.getStripeMode();
		res.status(statusCodes.OK).json(result);
	},

	/** get settings for payments */
	getPaymentSetting: async (req, res) => {
		const data = req.query;
		const result = await PaymentService.getPaymentSetting(data);
		res.status(statusCodes.OK).json(result);
	},

	/** getAccountById */
	getAccountById: async (req, res) => {
		const { id } = req.params;
		const result = await StripeService.getAccountId(id);
		res.status(statusCodes.OK).json(result);
	},

	/** Get payments by criteria */
	getByCriteria: async (req, res) => {
		const pagination = _.pick(req.query, ['limit', 'offset']);
		const criteria = _.pick(req.query, ['targetType', 'targetId', 'confirmed', 'createdAt']);
		const userId = req.user.id;
		const result = await PaymentService.getByCriteria(userId, criteria, pagination);
		res.status(statusCodes.OK).json(result);
	},
};
