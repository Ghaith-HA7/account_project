const moment = require('moment');
const winston = require('winston');
const chalk = require('chalk');
const path = require('path');

let successFileName, warningFileName, errorFileName;
const logsDirName = path.join(process.cwd(), 'logs');
successFileName = path.join(logsDirName, 'success.log');
warningFileName = path.join(logsDirName, 'warning.log');
errorFileName = path.join(logsDirName, 'error.log');

levels = {
	error: 0,
	warning: 1,
	success: 2,
};

/**
 * @type import('winston').Logger
 */
let fileLogger = null;

const middleware = (req, res, next) => {
	if (res.locals.supressLogs) next();
	const startTime = Date.now();
	var json = res.json;
	res.json = function (data) {
		if (!res.locals.supressLogs) res.locals.response = data;
		json.call(this, data);
	};
	res.on('finish', () => {
		const log = {
			method: req.method,
			remoteAddress: req.headers['x-forwarded-for']
				? req.headers['x-forwarded-for'].split(',')[0]
				: req.connection.remoteAddress,
			url: req.originalUrl,
			statusCode: res.statusCode,
			responseTime: Date.now() - startTime,
			query: req.query,
			body: req.body,
			params: req.params,
			response: res.locals.response ? res.locals.response : res.locals.err,
		};
		let level = 'success';
		if (log.statusCode >= 500) level = 'error';
		else if (log.statusCode >= 400) level = 'warning';
		else level = 'success';
		fileLogger.log(level, undefined, { log });
	});
	next();
};

module.exports = () => {
	if (fileLogger == null) {
		fileLogger = winston.createLogger({
			levels,
			format: winston.format.combine(
				winston.format.ms(),
				winston.format.timestamp(),
				winston.format.printf(({ level, log, timestamp, ms }) => {
					timestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
					ms = ms.padStart(7);
					const responseTime = log.responseTime + 'ms';
					let data = {};
					if (log.query && Object.keys(log.query).length !== 0) data = { ...data, ...log.query };
					if (log.body && Object.keys(log.body).length !== 0) data = { ...data, ...log.body };
					if (log.params && Object.keys(log.params).length !== 0) data = { ...data, ...log.params };
					const logData = {
						timestamp: timestamp,
						timeElapsed: ms,
						level,
						method: log.method,
						remoteAddress: log.remoteAddress,
						url: log.url,
						statusCode: log.statusCode,
						responseTime,
						request: data,
						response: log.response,
					};
					return JSON.stringify(logData);
				})
			),
			transports: [
				new winston.transports.File({ level: 'success', filename: successFileName }),
				new winston.transports.File({ level: 'warning', filename: warningFileName }),
				new winston.transports.File({ level: 'error', filename: errorFileName }),
			],
		});
	}

	return middleware;
};
