const express = require('express');
const router = express.Router();
const { catchAsync } = require('usol-utils');
const controller = require('./controllers/user');
const validator = require('./validators/user');
const authController = require('../auth/controllers/auth');
const Roles = require('../../utils/Roles');

/*************************
 * @Router /user         *
 *************************/
router.use('/settings', require('./routers/userSetting'));
router
	.route('/')
	.get(catchAsync(controller.getInfo))
	.post(authController.restrictTo(Roles.superAdmin), validator.create, catchAsync(controller.create))
	.patch(validator.update, catchAsync(controller.update))
	.delete(catchAsync(controller.delete));

router.patch('/profile-image', controller.uploadProfileImage, catchAsync(controller.updateImage));

router.post('/symptoms', validator.createSymptoms, catchAsync(controller.createSymptoms));

router.get('/status', catchAsync(controller.status));

router.get('/list', validator.getList, catchAsync(authController.restrictTo(Roles.superAdmin), controller.getList));

router.get(
	'/payments',
	validator.getUserPayments,
	catchAsync(authController.restrictTo(Roles.superAdmin), controller.getUserPayments)
);

router.get('/prayers-occasions', catchAsync(controller.getUserPrayersAndOccasions));

router.use(authController.restrictTo(Roles.superAdmin));
router
	.route('/:id')
	.get(validator.getById, catchAsync(controller.getById))
	.patch(validator.updateById, catchAsync(controller.updateById))
	.delete(validator.deleteById, catchAsync(controller.deleteById));

module.exports = router;
