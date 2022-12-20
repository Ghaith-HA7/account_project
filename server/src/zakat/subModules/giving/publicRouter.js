const { catchAsync } = require('usol-utils');
const handler = require('./controllers/giving');
const validator = require('./validators/giving');
const router = require('express').Router();

/*********************************
 * @Router /public/givings *
 *********************************/

router.get('/:id', validator.paramId, catchAsync(handler.getById));
router.get('/', validator.getList, catchAsync(handler.getList));

module.exports = router;
