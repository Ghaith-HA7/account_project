const statusCodes = require('../statusCodes');
class Exception extends Error {
	constructor(status, msg = undefined, err = {}) {
		if (msg === undefined) {
			switch (status) {
				case statusCodes.BAD_REQUEST:
					msg = 'Bad Request';
					break;
				case statusCodes.CREATED:
					msg = 'Created';
					break;
				case statusCodes.DELETED:
					msg = 'Deleted';
					break;
				case statusCodes.DUPLICATED_ENTRY:
					msg = 'Duplicated Entry';
					break;
				case statusCodes.FORBIDDEN:
					msg = 'Access Denied';
					break;
				case statusCodes.INTERNAL_SERVER_ERROR:
					msg = 'Internal Server Error';
					break;
				case statusCodes.INVALID_OPERATION:
					msg = 'Invalid Operation';
					break;
				case statusCodes.ITEM_NOT_FOUND:
					msg = 'Item not Found';
					break;
				case statusCodes.NOT_FOUND:
					msg = 'Not Found';
					break;
				case statusCodes.OK:
					msg = 'OK';
					break;
				case statusCodes.UNAUTHORIZED:
					msg = 'Unauthorized';
					break;
				case statusCodes.UPDATED:
					msg = 'Updated';
					break;
				case statusCodes.VALIDATION_ERROR:
					msg = 'Validation Error';
					break;
			}
		}

		super(msg);
		this.httpStatusCode = status;
		if (err) Object.assign(this, err);
	}

	static requestDefaultHandler(err, req, res, next) {
		let httpStatusCode = typeof err === 'number' ? err : err.httpStatusCode || statusCodes.INTERNAL_SERVER_ERROR;
		let msg = err.message || undefined;

		if (err.isAxiosError === true) {
			// *Axios Error
			if (err.response.data.message === 'city not found') {
				msg = 'Unable to find location. Try another search.';
				httpStatusCode = statusCodes.BAD_REQUEST;
			}
		}
		if (err.errno === 1451) {
			// *MySQL: A foreign key constraint would fail
			msg = 'Cannot delete, data used elsewhere';
			httpStatusCode = statusCodes.BAD_REQUEST;
		}
		if (err.errno === 1452) {
			// *MySQL: A foreign key constraint would fail
			msg = 'Cannot add or update non existing child data';
			httpStatusCode = statusCodes.BAD_REQUEST;
		}
		if (err.errno === 1062) {
			// *MySQL:
			msg = err.sqlMessage;
			httpStatusCode = statusCodes.DUPLICATED_ENTRY;
		}
		if (err.code === 'LIMIT_FILE_SIZE') {
			// *Multer
			msg = 'Max upload limit exceeded';
			httpStatusCode = statusCodes.BAD_REQUEST;
		}
		if (err.message && err.message.startsWith('Empty .update() call detected!')) {
			// *Not sure if MySQL or Knex
			msg = 'Empty or wrong body data';
			httpStatusCode = statusCodes.BAD_REQUEST;
		}
		if (!res.headersSent) {
			try {
				msg = JSON.parse(msg);
			} catch {}
			httpStatusCode === statusCodes.INTERNAL_SERVER_ERROR || msg === undefined
				? res.sendStatus(httpStatusCode)
				: res.status(httpStatusCode).json({ msg });
		}
		if (!err.msg) msg = err.toString();
		if (httpStatusCode === statusCodes.INTERNAL_SERVER_ERROR) {
			console.error(err);
		}

		// this is for exception handling for fileLogger
		res.locals.err = { msg, stack: err.stack.toString() };
	}

	static defaultHandler(err) {
		console.error(err);
		process.exit(1);
	}
}

global.Exception = Exception;
module.exports = Exception;
