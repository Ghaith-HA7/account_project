const { statusCodes } = require('usol-utils');
const { genUploader } = require('../../../utils');

const ZakatService = require('../services/zakat');

module.exports = {
	estimateZakatApply: async (req, res) => {
		const data = req.query;
		const estimatedAmount = await ZakatService.estimateZakatApply(data);
		res.status(statusCodes.OK).json({ msg: 'OK', data: { estimatedAmount } });
	},

	applyForZakat: (type) => async (req, res) => {
		const data = req.body;
		const userId = req.user.id;
		const assets = res.locals.assets;
		const result = await ZakatService.applyForZakat(data, userId, assets, type);
		res.status(statusCodes.CREATED).json({ msg: 'CREATED', data: result });
	},

	processZakatApply: (type) => async (req, res) => {
		const data = req.body;
		const user = req.user;
		const id = req.params.id;
		const result = await ZakatService.processZakatApply(id, data, user, type);
		res.status(statusCodes.UPDATED).json({ msg: 'UPDATED', data: result });
	},

	zakatRequests: (type) => async (req, res) => {
		const result = await ZakatService.zakatRequests(type);
		res.status(statusCodes.OK).json({ msg: 'OK', data: result });
	},

	myRequests: (type) => async (req, res) => {
		const userId = req.user.id;
		const result = await ZakatService.myRequests(userId, type);
		res.status(statusCodes.OK).json({ msg: 'OK', data: result });
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
};
