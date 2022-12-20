const { catchAsync } = require('usol-utils');
const controller = require('./controllers/booking');
const validator = require('./validators/booking');
const router = require('express').Router();

router.get('/', validator.bookings, catchAsync(controller.getBookingList));

router.get(
	'/status',
	validator.getBookingStatus,
	catchAsync(controller.restrict('query')),
	catchAsync(controller.getBookingStatus)
);

router.patch(
	'/authorize',
	validator.authorize,
	catchAsync(controller.restrict('body')),
	catchAsync(controller.authorize)
);

module.exports = router;
