const { catchAsync } = require('usol-utils');
const handler = require('./controllers/giving');
const validator = require('./validators/giving');
const authController = require('../../../auth/controllers/auth');
const Roles = require('../../../../utils/Roles');
const router = require('express').Router();

/*********************************
 * @Router /givings *
 *********************************/

router.post(
	'/',
	handler.uploader,
	validator.save,
	catchAsync(authController.restrictTo(Roles.superAdmin), handler.save)
);
router.post('/:id/donate', validator.donate, catchAsync(handler.donate));
router.post('/:id/user-interest', validator.paramId, catchAsync(handler.saveInterest));
router.post('/:id/user-share', validator.paramId, catchAsync(handler.saveShare));

router.patch('/:id', validator.update, catchAsync(authController.restrictTo(Roles.superAdmin), handler.update));
router.patch(
	'/:id/attachment',
	handler.uploader,
	validator.paramId,
	catchAsync(authController.restrictTo(Roles.superAdmin), handler.updateImage)
);

router.delete('/:id', validator.paramId, catchAsync(authController.restrictTo(Roles.superAdmin), handler.delete));
router.delete('/:id/user-interest', validator.paramId, catchAsync(handler.deleteInterest));
router.delete('/:id/user-share', validator.paramId, catchAsync(handler.deleteShare));

module.exports = router;
