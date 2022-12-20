const moment = require('moment');
const winston = require('winston');
const chalk = require('chalk');

/**
 * @type import('winston').Logger
 */
let httpLogger = null;

const middleware = (req, res, next) => {
	if (res.locals.supressLogs) next();
	const startTime = Date.now();
	res.on('finish', () => {
		const log = {
			method: req.method,
			remoteAddress: req.headers['x-forwarded-for']
				? req.headers['x-forwarded-for'].split(',')[0]
				: req.connection.remoteAddress,
			url: req.originalUrl,
			statusCode: res.statusCode,
			responseTime: Date.now() - startTime,
		};
		httpLogger.log('HTTP', undefined, { log });
	});
	next();
};

module.exports = () => {
	if (httpLogger == null) {
		httpLogger = winston.createLogger({
			level: 'HTTP',
			levels: { HTTP: 0 },
			format: winston.format.combine(
				winston.format.ms(),
				winston.format.timestamp(),
				winston.format.printf(({ level, log, timestamp, ms }) => {
					level = chalk.bold.magenta(level);
					timestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
					timestamp = chalk.blue(timestamp);
					ms = chalk.white(ms.padStart(7));
					const method = chalk.bold.greenBright(log.method);
					const remoteAddress = chalk.redBright(log.remoteAddress.padStart(15));
					const url = chalk.whiteBright(log.url);
					const statusCode =
						log.statusCode > 300
							? chalk.bold.redBright(log.statusCode)
							: chalk.bold.yellowBright(log.statusCode);
					const responseTime = chalk.cyanBright(log.responseTime + 'ms');
					return `${timestamp}  ${ms}  ${level}: ${method}  ${remoteAddress}  ${url}  ${statusCode}  ${responseTime}`;
				})
			),
			transports: [new winston.transports.Console()],
		});
	}

	return middleware;
};
