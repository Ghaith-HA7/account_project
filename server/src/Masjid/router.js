const { catchAsync } = require('usol-utils');
const { Roles } = require('../../utils');
const handler = require('./controllers/masjid');
const fileHandler = require('./controllers/file');
const validator = require('./validators/masjid');
const checkinHandler = require('./controllers/checkin');
const checkinValidator = require('./validators/checkin');
const hallHandler = require('./controllers/hall');
const hallValidator = require('./validators/hall');
const authController = require('../auth/controllers/auth');
const router = require('express').Router();
/*********************************
 * @Router /api/public/masjid *
 *********************************/
router.use('/events', require('./subModules/Events/router'));

router.get('/my-checkins', catchAsync(handler.getMyCheckins));
router.get('/check-in-history', checkinValidator.getHistory, catchAsync(checkinHandler.getHistory));
router.get('/upcoming-bookings', catchAsync(checkinHandler.getUpcomingBookings));

router
	.route('/:id/follow')
	.post(validator.paramId, catchAsync(handler.followMasjid))
	.delete(validator.paramId, catchAsync(handler.unFollowMasjid));

router.get('/delete-my-checkins-bookings', catchAsync(checkinHandler.deleteMyCheckinsBookings));

router.post('/', validator.save, catchAsync(authController.restrictTo(Roles.superAdmin), handler.save));

router.post(
	'/:id/custom-prayer',
	validator.saveCustomPrayer,
	catchAsync(handler.restrictToMasjidAdmin, handler.saveCustomPrayer)
);

router.post('/:id/book', checkinValidator.book, catchAsync(checkinHandler.book));

router.post('/:id/check-in', checkinValidator.checkIn, catchAsync(checkinHandler.checkIn));
router.delete('/:id/check-in', checkinValidator.deleteCheckin, catchAsync(checkinHandler.deleteCheckin));

router.post(
	'/:id/hall/generate-code',
	hallValidator.generateRemoveCode,
	catchAsync(handler.restrictToMasjidAdmin, hallHandler.generateCode)
);
router.delete(
	'/:id/hall/remove-code',
	hallValidator.generateRemoveCode,
	catchAsync(handler.restrictToMasjidAdmin, hallHandler.removeCode)
);

router.post('/:id/hall', hallValidator.save, catchAsync(handler.restrictToMasjidAdmin, hallHandler.save));

router.post('/:id/donate', validator.donate, catchAsync(handler.donate));

router.patch('/:id', validator.update, catchAsync(handler.restrictToMasjidAdmin, handler.update));
router.patch('/:id/attachment', catchAsync(handler.restrictToMasjidAdmin, fileHandler.save));
router.patch('/hall/:hallId', hallValidator.update, catchAsync(handler.restrictToMasjidAdmin, hallHandler.update));
router.patch(
	'/:id/daily-prayer/:prayerId',
	validator.updateDailyPrayer,
	catchAsync(handler.restrictToMasjidAdmin, handler.updateDailyPrayer)
);
router.patch(
	'/:id/custom-prayer/:prayerId',
	validator.updateCustomPrayer,
	catchAsync(handler.restrictToMasjidAdmin, handler.updateCustomPrayer)
);

router.delete('/:id', validator.paramId, catchAsync(authController.restrictTo(Roles.superAdmin), handler.delete));
router.delete('/hall/:hallId', hallValidator.paramId, catchAsync(handler.restrictToMasjidAdmin, hallHandler.delete));
router.delete(
	'/:id/custom-prayer/:prayerId',
	validator.paramId,
	catchAsync(handler.restrictToMasjidAdmin, handler.deleteCustomPrayer)
);

module.exports = router;
