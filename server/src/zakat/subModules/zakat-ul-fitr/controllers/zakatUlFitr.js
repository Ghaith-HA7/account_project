const ZakatService = require('../services/zakatUlFitr');
const PaymentService = require('../../../../payment/services/payment');
const PaymentModel = require('../../../../payment/models/payment');
const { statusCodes } = require('usol-utils');
const { data } = require('currency-codes');
const { genUploader } = require('../../../../../utils');

module.exports = {
	fitra: async (req, res) => {
		const { numberOfMembers } = req.query;
		const data = await ZakatService.calcFitra(numberOfMembers);
		res.status(statusCodes.OK).json({ data });
	},

	setNisabFitr: async (req, res) => {
		const { value } = req.body;
		await ZakatService.setNisabFitr(value);
		res.sendStatus(statusCodes.CREATED);
	},

	/** add a user donate for zakat */
	donate: async (req, res) => {
		const userId = req.user.id;
		const data = req.body;
		const targetType = PaymentModel.targetTypes.ZakatUlFtr;
		const result = await PaymentService.splitTransfer(userId, targetType, data);
		res.status(statusCodes.CREATED).json(result);
	},

	uploader: genUploader({
		fields: [
			{ name: 'bankStatement', maxCount: 1 },
			{ name: 'firstPaystub', maxCount: 1 },
			{ name: 'secondPaystub', maxCount: 1 },
			{ name: 'thirdPaystub', maxCount: 1 },
			{ name: 'photoId', maxCount: 1 },
			{ name: 'ccbNotice', maxCount: 1 },
		],
		maxFileSize: 5,
		allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif', 'pdf'],
		directoryName: 'zakat\\documents',
	}),

	applyForZakat: async (req, res) => {
		const data = req.body;
		const userId = req.user.id;
		const assets = res.locals.assets;
		const result = await ZakatService.applyForZakat(data, userId, assets);
		res.status(statusCodes.CREATED).json({ msg: 'CREATED', data: result });
	},
};
