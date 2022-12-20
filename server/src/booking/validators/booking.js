const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');
const { body, query } = require('express-validator');

const bookings = chainBuilder([commonChain.pagination]);

const getBookingStatus = chainBuilder([
	commonChain.dateRequired(query('startOfDayDate')),
	commonChain.stringRequired(query('mobileNumber')),
	commonChain.integerRequired(query('eventId')),
]);

const authorize = chainBuilder([
	commonChain.dateRequired(body('startOfDayDate')),
	commonChain.stringRequired(body('mobileNumber')),
	commonChain.integerRequired(body('eventId')),
]);

module.exports = {
	bookings,
	getBookingStatus,
	authorize,
};
