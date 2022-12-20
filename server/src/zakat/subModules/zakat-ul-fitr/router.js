const express = require('express');
const router = express.Router();
const { catchAsync } = require('usol-utils');
const controller = require('./controllers/zakatUlFitr');
const zakatController = require('../../controllers/zakat');
const validator = require('./validators/zakatUlFitr');
const zakatValidator = require('../../validators/zakat');
const authController = require('../../../auth/controllers/auth');
const Roles = require('../../../../utils/Roles');

/*********************************
 * @Router /zakat-ul-fitr *
 *********************************/

router.get('/estimate', zakatValidator.estimateZakatApply, catchAsync(zakatController.estimateZakatApply));

router.route('/').get(validator.fitra, catchAsync(controller.fitra));

router.post('/', controller.uploader, validator.applyForZakat, catchAsync(controller.applyForZakat));
router.post(
	'/set-nisab',
	validator.setNisabFitr,
	catchAsync(authController.restrictTo(Roles.superAdmin), controller.setNisabFitr)
);

router.post('/donate', validator.donate, catchAsync(controller.donate));

router.get('/requests', catchAsync(authController.restrictTo(Roles.superAdmin), zakatController.zakatRequests('fitr')));
router.get('/my-requests', catchAsync(zakatController.myRequests('fitr')));
router.patch(
	'/:id',
	zakatValidator.processZakatApply,
	catchAsync(authController.restrictTo(Roles.superAdmin), zakatController.processZakatApply('fitr'))
);

module.exports = router;
