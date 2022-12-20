const express = require('express');
const router = express.Router();
const { catchAsync } = require('usol-utils');
const validator = require('./validators/iftarMeals');
const controller = require('./controllers/iftarMeals');
const authController = require('../../../auth/controllers/auth');
const Roles = require('../../../../utils/Roles');

/*********************************
 * @Router /iftar-meals *
 *********************************/

router
	.route('/settings')
	.get(catchAsync(authController.restrictTo(Roles.superAdmin), controller.getSettings))
	.post(validator.setSettings, catchAsync(authController.restrictTo(Roles.superAdmin), controller.setSettings));

router.post('/donate', validator.donate, catchAsync(controller.donate));
module.exports = router;
