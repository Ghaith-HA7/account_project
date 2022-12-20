const { catchAsync } = require('usol-utils');
const controller = require('./controllers/masjidEvent');
const validator = require('./validators/masjidEvent');
const categoryController = require('./controllers/category');
const categoryValidator = require('./validators/category');
const router = require('express').Router();

/*********************************
 * @Router /masjid/events *
 *********************************/

router.get('/category', categoryValidator.getList, catchAsync(categoryController.getList));

router.get('/:id', validator.paramId, catchAsync(controller.getById));

router.get('/', validator.getList, catchAsync(controller.getList));

router
	.route('/:id/share')
	.get(validator.share, catchAsync(controller.getShareCount))
	.post(validator.share, catchAsync(controller.share));

module.exports = router;
