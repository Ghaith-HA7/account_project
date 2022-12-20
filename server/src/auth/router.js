const express = require('express');
const router = express.Router();
const { catchAsync } = require('usol-utils');

const controller = require('./controllers/auth');
const validator = require('./validators/auth');
/*************************
 * @Router /auth         *
 *************************/

router.post('/signup', validator.signUp, catchAsync(controller.signUp));
router.post('/verify', validator.verify, catchAsync(controller.verify));
router.post('/login', validator.login, catchAsync(controller.login));

module.exports = router;
