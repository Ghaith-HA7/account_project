const { catchAsync } = require('usol-utils');
const controller = require('./controllers/masjidEvent');
const categoryController = require('./controllers/category');
const categoryValidator = require('./validators/category');
const validator = require('./validators/masjidEvent');
const authController = require('../../../auth/controllers/auth');
const Roles = require('../../../../utils/Roles');
const router = require('express').Router();

/*********************************
 * @Router /events *
 *********************************/

router.post(
	'/category',
	categoryValidator.save,
	catchAsync(authController.restrictTo(Roles.superAdmin), categoryController.save)
);
router.delete(
	'/category/:name',
	categoryValidator.deleteByName,
	catchAsync(authController.restrictTo(Roles.superAdmin), categoryController.deleteByName)
);

router.post('/', controller.upload, validator.save, catchAsync(controller.save));

router.post('/:id/register', validator.registerUser, catchAsync(controller.registerUser));
router.delete('/:id/un-register', validator.paramId, catchAsync(controller.unregisterUser));

router.patch(
	'/:id/attachment',
	controller.upload,
	validator.paramId,
	catchAsync(authController.restrictTo(Roles.superAdmin), controller.updateAttachment)
);

router.post('/:id/user-interest', validator.paramId, catchAsync(controller.saveInterest));
router.delete('/:id/user-interest', validator.paramId, catchAsync(controller.deleteInterest));

module.exports = router;
