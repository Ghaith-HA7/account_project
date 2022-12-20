const config = require('config');
const { S3 } = require('aws-sdk');

/**
 * @type {require('aws-sdk').S3}
 */
let s3 = null;
let keys = null;
let privateBucket = null;
let publicBucket = null;

if (config.has('S3')) {
	const s3Config = config.get('S3');
	let { accessKeyId, secretAccessKey, publicBucketName, privateBucketName, signatureVersion, region } = s3Config;
	privateBucket = privateBucketName;
	publicBucket = publicBucketName;
	if (accessKeyId && secretAccessKey && signatureVersion && region) {
		keys = { accessKeyId, secretAccessKey, signatureVersion, region };
		s3 = new S3(keys);
	} else console.warn('Missing AWS {S3} configs');
} else console.warn('Missing AWS {S3} configs');

function checkS3() {
	if (s3 == null) throw new Error('Missing AWS {S3} configs');
}
class AWS {
	/**
	 * @returns {String}
	 */
	static getPrivateBucket() {
		checkS3();
		if (privateBucket == null) throw new Error('S3 missing privateBucketName in configs');
		return privateBucket;
	}
	/**
	 * @returns {String}
	 */
	static getPublicBucket() {
		checkS3();
		if (publicBucket == null) throw new Error('S3 missing publicBucketName in configs');
		return publicBucket;
	}

	/**
	 *
	 * @param {Boolean} isPrivate
	 */
	static getBucket(isPrivate) {
		return isPrivate ? this.getPrivateBucket() : this.getPublicBucket();
	}

	/**
	 * @returns {{accessKeyId: String, secretAccessKey: String}}
	 */
	static getKeys() {
		checkS3();
		return { accessKeyId };
	}

	/**
	 * @returns {require('AWS').S3}
	 */
	static getS3() {
		checkS3();
		return s3;
	}

	/**
	 *
	 * @param {String} Key
	 * @param {ReadStream} Body
	 * @param {Boolean}isPrivate
	 * @param {Function}cb
	 */
	static uploadToS3(Key, Body, isPrivate, cb) {
		let Bucket = isPrivate ? this.getPrivateBucket() : this.getPublicBucket();
		const params = {
			Bucket,
			Key,
			Body,
		};
		let size = 0;

		const upload = s3.upload(params);
		upload.on('httpUploadProgress', function (ev) {
			if (ev.total) size = ev.total;
		});
		upload.send(function (err, result) {
			if (err) return cb(err);
			else {
				cb(null, {
					size,
					bucket: Bucket,
					Key,
					Location: result.Location,
					versionId: result.VersionId,
				});
			}
		});
	}

	/**
	 *
	 * @param {String} Key
	 * @param {Boolean}isPrivate
	 */
	static deleteFromS3(Key, isPrivate) {
		let Bucket = isPrivate ? this.getPrivateBucket() : this.getPublicBucket();
		console.info(`deleting ${Key} From S3 `);
		const params = {
			Bucket,
			Key,
		};

		return new Promise((resolve, reject) => {
			s3.deleteObject(params, (err, response) => {
				if (err) return reject(err);
				return resolve(response);
			});
		});
	}

	/**
	 *
	 * @param {String}Key
	 * @param {boolean}isPrivate
	 * @param {Number}[Expires]
	 * @return {string}
	 */
	static getSignedURL(Key, isPrivate, Expires = 100) {
		let Bucket = isPrivate ? this.getPrivateBucket() : this.getPublicBucket();
		return s3.getSignedUrl('getObject', {
			Bucket,
			Key,
			Expires,
		});
	}
}

module.exports = AWS;
