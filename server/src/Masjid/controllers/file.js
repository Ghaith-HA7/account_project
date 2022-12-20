const File = require('../services/file');
const { statusCodes } = require('usol-utils');

module.exports = {
	/** Add a new attachment */
	save: async (req, res) => {
		const masjidId = req.params.id;
		const file = new File();
		const assetFile = await file.save();
		assetFile(req, res, async (err) => {
			if (err) {
				res.status(statusCodes.BAD_REQUEST).json();
			}
			let type = req.body.type;
			let url = res.locals.assets.file[0].url;
			/** validate type because we use form-data */
			if (!type) {
				let msg = { msg: 'type is required' };
				res.status(statusCodes.VALIDATION_ERROR).json(msg);
			}
			if (type !== 'img' && type !== 'coverImg') {
				let msg = { msg: "type value should be either ['img','coverImg']" };
				res.status(statusCodes.VALIDATION_ERROR).json(msg);
			}
			await file.update(masjidId, url, type);
			res.status(statusCodes.UPDATED).json();
		});
	},
};
