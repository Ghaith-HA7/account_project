const express = require('express');
const router = express.Router();
const { catchAsync } = require('usol-utils');
const validator = require('./validators/iftarMeals');
const controller = require('./controllers/iftarMeals');

router.get('/', validator.getList, catchAsync(controller.getList));

module.exports = router;
