const { catchAsync } = require('usol-utils');
const handler = require('./controllers/payment');
const validator = require('./validators/payment');

const router = require('express').Router();
/*********************************
 * @Router /public/payment *
 *********************************/
router.post('/stripe-webhook', catchAsync(handler.eventWebook));

module.exports = router;
