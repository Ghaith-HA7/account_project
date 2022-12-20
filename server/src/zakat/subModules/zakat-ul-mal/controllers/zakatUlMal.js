const { statusCodes } = require('usol-utils');
const PaymentModel = require('../../../../payment/models/payment');
const PaymentService = require('../../../../payment/services/payment');
const ZakatUlMalService = require('../services/zakatUlMal');

module.exports = {
	zakat: async (req, res) => {
		const data = req.query;
		const result = await new ZakatUlMalService(data).calcZakat();
		res.status(statusCodes.OK).json({ msg: 'OK', data: result });
	},

	setSettings: async (req, res) => {
		const data = req.body;
		const result = await ZakatUlMalService.setSettings(data);
		res.sendStatus(statusCodes.UPDATED);
	},

	/** add a user donate for zakat */
	donate: async (req, res) => {
		const userId = req.user.id;
		const data = req.body;
		const targetType = PaymentModel.targetTypes.ZakatUlMal;
		const result = await PaymentService.splitTransfer(userId, targetType, data);
		res.status(statusCodes.CREATED).json(result);
	},

	getSettings: async (req, res) => {
		const result = await ZakatUlMalService.getSettings();
		res.status(statusCodes.OK).json({ msg: 'OK', data: result });
	},
};
