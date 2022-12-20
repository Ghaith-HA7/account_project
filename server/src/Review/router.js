const router = require('express').Router();
const reviewValidation = require('./validations/review');
const reviewController = require('./controllers/review');
const { catchAsync } = require('usol-utils');
/*********************************
 * @Router /review
 *********************************/

router.post('/', reviewValidation.save, catchAsync(reviewController.save));

module.exports = router;
