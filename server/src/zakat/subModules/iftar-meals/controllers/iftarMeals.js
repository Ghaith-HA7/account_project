const { statusCodes } = require('usol-utils');
const PaymentModel = require('../../../../payment/models/payment');
const PaymentService = require('../../../../payment/services/payment');
const IftarMealService = require('../services/iftarMeals');
module.exports = {
	setSettings: async (req, res) => {
		const data = req.body;
		const result = await IftarMealService.setSettings(data);
		res.sendStatus(statusCodes.UPDATED);
	},

	/** add user donation to meal */
	donate: async (req, res) => {
		const userId = req.user.id;
		const FeeData = req.body;
		const date = req.query.date;
		const data = { ...FeeData, date };
		const targetType = PaymentModel.targetTypes.Meals;
		const result = await PaymentService.splitTransfer(userId, targetType, data);
		res.status(statusCodes.CREATED).json(result);
	},

	getSettings: async (req, res) => {
		const result = await IftarMealService.getSettings();
		res.status(statusCodes.OK).json({ msg: 'OK', data: result });
	},

	getList: async (req, res) => {
		const query = req.query;
		const data = await IftarMealService.getList(query);
		res.status(statusCodes.OK).json({ msg: 'OK', data });
	},
};
