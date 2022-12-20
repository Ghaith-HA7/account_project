process.env.TZ = 'UTC';
const _ = require('lodash');

const logger = require('./logger/console');

console.log = function () {
	return logger.info.apply(logger, arguments);
};
console.info = function () {
	return logger.info.apply(logger, arguments);
};
console.warn = function () {
	return logger.warn.apply(logger, arguments);
};
console.debug = function () {
	return logger.debug.apply(logger, arguments);
};
console.error = function () {
	return logger.error.apply(logger, arguments);
};

global._ = _;

module.exports = {
	cache: require('./cache'),
	catchAsync: require('./errorHandlers/catchAsync'),
	Exception: require('./errorHandlers/exception'),
	validator: { chainBuilder: require('./validator/chainBuilder'), commonChain: require('./validator/commonChains') },
	statusCodes: require('./statusCodes'),
	database: require('./database'),
	genUploader: require('./uploader'),
	comms: {
		sms: require('./sms'),
		whatsapp: require('./whatsapp'),
		email: require('./emailer'),
	},
	startup: {
		promises: [],
	},
	permissionUtils: require('./permissions'),
	argv: require('args-parser')(process.argv),
	binary: require('./binary'),
	loggers: {
		createFileLogger: require('./logger/fileLogger'),
		createHttpLogger: require('./logger/httpLogger'),
	},
	supressLogs: require('./logger/supressLogs'),
	scheduling: {
		Job: require('./scheduling/job'),
		launchJob: require('./scheduling/startJob'),
	},
};
