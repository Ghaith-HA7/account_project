const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const sharp = require('sharp');
const statusCodes = require('./../statusCodes');
const AWS = require('./aws');

function getFilename(req, file, cb) {
	crypto.pseudoRandomBytes(16, function (err, raw) {
		cb(err, err ? undefined : raw.toString('hex'));
	});
}

/**
 * This function takes a filestream and store file locally to the final path.
 * The Listener is a function used to be called when finishing piping the file with the outStream param passed.
 *
 * @param {String} finalPath
 * @param {ReadStream}fileStream
 * @param {function}cb - callback function
 * @param {function}listener - on finish event listener
 */
function storeLocally(finalPath, fileStream, cb, listener) {
	const outStream = fs.createWriteStream(finalPath);
	fileStream.pipe(outStream);
	outStream.on('error', cb);
	outStream.on('finish', listener.bind(null, outStream));
}

/**
 *
 * @param {Object}metadata
 * @param {{maxHeight: Number, maxWidth: Number}}options
 * @return {null|| String}
 */
function validateImage(metadata, options) {
	const { width, height } = metadata;
	const { maxWidth, maxHeight } = options;
	let widthErr = null,
		heightErr = null,
		err = null;

	if (maxHeight && height > maxHeight) heightErr = `Height must be smaller than or equal ${maxHeight} pixels.`;
	if (maxWidth && width > maxWidth) widthErr = `Width must be smaller than or equal ${maxWidth} pixels.`;

	if (heightErr && widthErr) err = heightErr + ' and ' + widthErr;
	else if (heightErr) err = heightErr;
	else if (widthErr) err = widthErr;
	return err;
}

/**
 *
 * @param {String} destination
 * @param {String}filename
 * @param {File}file
 * @param {Boolean}isLocal
 * @param {Boolean}isPrivate
 * @param {{maxHeight, maxWidth}}options
 * @param {Function}cb
 */
function store(destination, filename, file, isLocal, isPrivate, options, cb) {
	let privacy = isPrivate ? 'private' : 'public';
	mkdirp.sync(path.join('assets', privacy, destination));
	const finalPath = path.join('assets', privacy, destination, filename);
	const { maxWidth, maxHeight } = options;

	//temp storage is needed
	if (maxWidth || maxHeight) {
		mkdirp.sync(path.join('assets', 'temp', privacy, destination));
		const tempPath = path.join('assets', 'temp', privacy, destination, filename);
		const tempWriteStream = fs.createWriteStream(tempPath);
		file.stream.pipe(tempWriteStream);
		tempWriteStream.on('error', cb);
		tempWriteStream.on('finish', function () {
			sharp(tempPath)
				.metadata()
				.then((metadata) => {
					let err = validateImage(metadata, options);
					if (err) {
						fs.unlink(tempPath, (error) => {
							if (error) cb(error);
							else cb(new Exception(statusCodes.VALIDATION_ERROR, err));
						});
					} else {
						//passed validation so store file from temp to local or aws then delete temp when finish
						const tempStream = fs.createReadStream(tempPath);
						if (isLocal) {
							storeLocally(finalPath, tempStream, cb, (outStream) => {
								fs.unlink(tempPath, (error) => {
									if (error) cb(error);
									else
										cb(null, {
											destination,
											filename,
											path: finalPath,
											size: outStream.bytesWritten,
											isLocal,
										});
								});
							});
						} else {
							AWS.uploadToS3(filename, tempStream, isPrivate, (err, res) => {
								if (err) cb(err);
								else {
									fs.unlink(tempPath, (error) => {
										if (error) cb(error);
										else {
											res.isLocal = isLocal;
											cb(null, res);
										}
									});
								}
							});
						}
					}
				});
		});
	}
	//no need to temp storage, store directly to final storage
	else {
		if (isLocal) {
			storeLocally(finalPath, file.stream, cb, (outStream) => {
				cb(null, {
					destination,
					filename,
					path: finalPath,
					size: outStream.bytesWritten,
					isLocal,
				});
			});
		} else {
			AWS.uploadToS3(filename, file.stream, isPrivate, (err, res) => {
				if (err) cb(err);
				else {
					res.isLocal = isLocal;
					cb(null, res);
				}
			});
		}
	}
}

/**
 *
 * @param {{filename: String || Function, destination: String, isPrivate: boolean,isLocal: boolean, maxHeight: Number, maxWidth: Number }}opts
 * @constructor
 */
function DiskStorage(opts) {
	this.getFilename = opts.filename || getFilename;
	this.destination = opts.destination || 'default';
	this.isPrivate = opts.isPrivate || false;
	this.isLocal = opts.isLocal && true;
	if (!this.isLocal) {
		try {
			AWS.getBucket(this.isPrivate);
			AWS.getS3();
		} catch (error) {
			console.warn(error.message);
			console.warn('Uploading storage reverted to local');
			this.isLocal = true;
		}
	}
	this.options = {};
	this.options.maxWidth = opts.maxWidth || null;
	this.options.maxHeight = opts.maxHeight || null;
}

DiskStorage.prototype._handleFile = function _handleFile(req, file, cb) {
	const that = this;
	that.getFilename(req, file, function (err, filename) {
		if (err) return cb(err);
		let destination = that.destination,
			options = that.options,
			isLocal = that.isLocal,
			isPrivate = that.isPrivate;
		store(destination, filename, file, isLocal, isPrivate, options, cb);
	});
};

DiskStorage.prototype._removeFile = function _removeFile(req, file, cb) {
	if (this.isLocal) {
		const path = file.path;

		delete file.destination;
		delete file.filename;
		delete file.path;

		fs.unlink(path, cb);
	} else {
		AWS.deleteFromS3(file.key, this.isPrivate)
			.then((r) => {
				cb(null, r);
			})
			.catch((e) => {
				cb(e);
			});
	}
};
/**
 *
 * @param {{filename: String || Function, destination: String, isPrivate: boolean,isLocal: boolean, maxHeight: Number, maxWidth: Number }} opts
 * @return {DiskStorage}
 */
module.exports = function (opts) {
	return new DiskStorage(opts);
};
