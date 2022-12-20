const express = require('express');
const router = express.Router();
const { catchAsync } = require('usol-utils');
const controller = require('./controllers/zakatUlMal');
const zakatController = require('../../controllers/zakat');
const validator = require('./validators/zakatUlMal');
const zakatValidator = require('../../validators/zakat');
const authController = require('../../../auth/controllers/auth');
const Roles = require('../../../../utils/Roles');

/*********************************
 * @Router /zakat-ul-mal *
 *********************************/

router.get('/estimate', zakatValidator.estimateZakatApply, catchAsync(zakatController.estimateZakatApply));

router
	.route('/')
	.get(validator.zakat, catchAsync(controller.zakat))
	.post(zakatController.uploader, zakatValidator.applyForZakat, catchAsync(zakatController.applyForZakat('mal')));

router.post('/donate', validator.donate, catchAsync(controller.donate));

router.get('/requests', catchAsync(authController.restrictTo(Roles.superAdmin), zakatController.zakatRequests('mal')));
router.get('/my-requests', catchAsync(zakatController.myRequests('mal')));
router.patch(
	'/:id',
	zakatValidator.processZakatApply,
	catchAsync(authController.restrictTo(Roles.superAdmin), zakatController.processZakatApply('mal'))
);
router
	.route('/settings')
	.get(catchAsync(authController.restrictTo(Roles.superAdmin), controller.getSettings))
	.post(validator.setSettings, catchAsync(authController.restrictTo(Roles.superAdmin), controller.setSettings));
module.exports = router;
