const multer = require('multer');
const path = require('path');
const Asset = require('./asset');
const uuid = require('uuid');
const statusCodes = require('./../statusCodes');
const Exception = require('./../errorHandlers/exception');
const StorageEngine = require('./storageEngine');

/**
 *
 * @param {Array<String>} types
 * @param {File}file
 * @param {Function}cb
 * @return {Function}
 */
function checkFileType(types, file, cb) {
	const fileTypes = new RegExp(types.join('|'));
	const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
	const mimeType = fileTypes.test(file.mimetype);
	if (mimeType && extName) {
		return cb(null, true);
	} else {
		cb(new Exception(statusCodes.BAD_REQUEST, `File type not allowed, only ${types.join(', ')} are allowed`));
	}
}
/**
 * Generates files uploading middleware,
 * Uploaded assets are found in the map object: res.locals.assets
 *
 * @param {Object} options
 * @param {Array<{name: String , maxCount: Number}>} [options.fields] name is the key, maxCount is the max number of files
 * @param {Number} [options.maxFileSize] Megabytes
 * @param {Array<String>} [options.allowedFileTypes]
 * @param {string} [options.directoryName]
 * @param {boolean} [options.isPrivate]
 * @param {boolean} [options.isLocal]
 * @param {Number} [options.maxHeight] - pixels
 * @param {Number} [options.maxWidth] - pixels
 */
const middlewareGenerator = ({
	fields,
	maxFileSize,
	allowedFileTypes,
	directoryName = '',
	isPrivate = false,
	isLocal = true,
	maxHeight = null,
	maxWidth = null,
}) => {
	let storage = StorageEngine({
		destination: directoryName,
		filename: function (req, file, cb) {
			cb(null, file.fieldname + '-' + uuid.v4() + path.extname(file.originalname));
		},
		isPrivate,
		isLocal,
		maxWidth,
		maxHeight,
	});

	const upload = multer({
		storage: storage,
		limits: { fileSize: maxFileSize * 1024 * 1024 },
		fileFilter: function (req, file, cb) {
			checkFileType(allowedFileTypes, file, cb);
		},
	}).fields(fields);

	return (req, res, next) => {
		upload(req, res, async (err) => {
			if (err) {
				if (err.code == 'LIMIT_FILE_SIZE') {
					next(
						new Exception(statusCodes.BAD_REQUEST, `File size limit exceeded, maximum is ${maxFileSize}MB`)
					);
				} else if (err.code == 'LIMIT_UNEXPECTED_FILE') {
					next(new Exception(statusCodes.BAD_REQUEST, `Unexpected File key`));
				} else {
					next(err);
				}
			} else {
				if (req.files == undefined) {
					next();
				} else {
					if (!res.locals.assets) res.locals.assets = {};
					await Promise.all(
						fields.map(async (field) => {
							if (req.files[field.name]) {
								await Promise.all(
									req.files[field.name].map(async (file) => {
										let url, key;
										let local = file.isLocal;
										if (local)
											url = path.relative(
												path.join(process.cwd(), 'assets', isPrivate ? 'private' : 'public'),
												file.path
											);
										else {
											url = file.Location;
											key = file.Key;
										}

										const asset = await Asset.create({
											filename: file.originalname,
											url,
											sizeInBytes: file.size,
											isPrivate,
											isLocal: local,
											key,
										});
										if (!res.locals.assets[field.name]) res.locals.assets[field.name] = [];
										res.locals.assets[field.name].push(asset);
									})
								);
							}
						})
					);
					next();
				}
			}
		});
	};
};

module.exports = middlewareGenerator;
