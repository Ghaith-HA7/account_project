const Masjid = require('../models/masjid');
const { genUploader } = require('../../../utils');
const { statusCodes, Exception } = require('usol-utils');

class File {
	constructor() {}

	async save() {
		let result = genUploader({
			maxFileSize: 10,
			allowedFileTypes: ['jpg', 'jpeg', 'png'],
			directoryName: '/masjid',
			fields: [{ name: 'file' }],
		});
		return result;
	}

	async update(masjidId, attachmentUrl, type) {
		let masjid = await Masjid.findByPk(masjidId);
		if (!masjid) throw new Exception(statusCodes.ITEM_NOT_FOUND);
		if (type === 'img') {
			let asset = await Masjid.update(
				{ img: attachmentUrl },
				{
					where: {
						id: masjidId,
					},
				}
			);
			return asset;
		} else {
			let asset = await Masjid.update(
				{ coverImg: attachmentUrl },
				{
					where: {
						id: masjidId,
					},
				}
			);
			return asset;
		}
	}
}

module.exports = File;
