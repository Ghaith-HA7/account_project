const express = require('express');
const uploader = { middlewareGenerator: require('./../index') };
const path = require('path');
const Asset = require('./../asset');
const Exception = require('./../../errorHandlers/exception');
const { catchAsync } = require('./../../');

Asset.initialize();
Asset.sync().then((r) => {});
const upload = uploader.middlewareGenerator({
	fields: [
		{ name: 'myImage', maxCount: 2 },
		{ name: 'myImage2', maxCount: 2 },
	],
	maxFileSize: 2,
	allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif'],
	directoryName: 'test1',
	isPrivate: false,
	isLocal: true,
	maxHeight: 1,
	maxWidth: 1,
});

const app = express();

app.post('/upload', upload, async (req, res) => {
	//try to delete first asset and see if local or aws & db are deleted
	//await res.locals.assets[0].destroy();
	// setTimeout(async () => {
	// 	await res.locals.assets[0].destroy();
	// }, 60000);
	res.status(200).json({
		msg: 'OK',
		data: res.locals,
	});
});

const { privateAssetGetter } = require('./../middlewares');
app.get(
	'/image/:id',
	catchAsync(async (req, res, next) => {
		const asset = await Asset.findByPk(req.params.id);
		if (!asset) res.sendStatus(404);
		res.locals.asset = asset;
		next();
	}),
	privateAssetGetter
);

app.use(Exception.requestDefaultHandler);

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
