const AWS = require('./aws');
const statusCodes = require('./../statusCodes');
const Exception = require('./../errorHandlers/exception');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const catchAsync = require('./../errorHandlers/catchAsync');
/**
 *
 * @param req
 * @param res
 * @param next
 */
const privateAssetGetter = catchAsync(async (req, res) => {
	let asset = res.locals.asset;
	if (!asset) throw new Exception(statusCodes.INTERNAL_SERVER_ERROR, 'res.locals.asset is null');
	if (!asset.isPrivate) throw new Exception(statusCodes.BAD_REQUEST, `asset ${asset.filename} is public`);
	else {
		res.setHeader('content-disposition', `attachment; filename=${asset.filename}`);
		if (asset.isLocal) {
			await fs.createReadStream(path.join(process.cwd(), 'assets', 'private', asset.url)).pipe(res);
		} else {
			let result = await axios({
				method: 'get',
				url: AWS.getSignedURL(asset.key, true),
				responseType: 'stream',
			});
			result.data.pipe(res);
		}
	}
});

module.exports = {
	privateAssetGetter,
};
