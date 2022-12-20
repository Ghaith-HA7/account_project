const express = require('express');
const uploader = { middlewareGenerator: require('./../index') };
const { catchAsync, Exception } = require('usol-utils');

const upload = uploader.middlewareGenerator({
	fields: [{ name: 'myImage', maxCount: 1 }],
	maxFileSize: 2,
	allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif'],
	directoryName: 'test1',
});

const app = express();

app.post(
	'/upload',
	upload,
	catchAsync(async (req, res) => {
		res.status(200).json({
			msg: 'OK',
			data: res.locals.assets,
		});
	})
);

app.use(Exception.requestDefaultHandler);

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
