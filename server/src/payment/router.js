const { catchAsync } = require('usol-utils');
const handler = require('./controllers/payment');
const authHandler = require('../auth/controllers/auth');
const Roles = require('../../utils/Roles');
const validator = require('./validators/payment');
const router = require('express').Router();

/*********************************
 * @Router /payment *
 *********************************/

router.post(
	'/link-account',
	validator.linkAccount,
	catchAsync(authHandler.restrictTo(Roles.superAdmin), handler.linkAccount)
);

router.post(
	'/stripe-mode',
	validator.setStripeMode,
	catchAsync(authHandler.restrictTo(Roles.superAdmin), handler.setStripeMode)
);

router.post(
	'/default-app-fee',
	validator.setDefaultAppFee,
	catchAsync(authHandler.restrictTo(Roles.superAdmin), handler.setDefaultFee)
);

router.post('/app-fee', validator.setAppFee, catchAsync(authHandler.restrictTo(Roles.superAdmin), handler.setAppFee));

router.delete(
	'/unlink-account',
	validator.unlinkAccount,
	catchAsync(authHandler.restrictTo(Roles.superAdmin), handler.unlinkAccount)
);

router.get('/', validator.getByCriteria, catchAsync(handler.getByCriteria));

router.get(
	'/settings',
	validator.getPaymentSetting,
	catchAsync(authHandler.restrictTo(Roles.superAdmin), handler.getPaymentSetting)
);

router.get('/stripe-mode', catchAsync(authHandler.restrictTo(Roles.superAdmin), handler.getStripeMode));

module.exports = router;
