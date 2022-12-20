const router = require('express').Router();
const reviewController = require('./controllers/review');
const { catchAsync } = require('usol-utils');
/*********************************
 * @Router /review
 *********************************/

router.get('/', catchAsync(reviewController.getAll));

module.exports = router;
