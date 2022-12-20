const { catchAsync } = require('usol-utils');
const handler = require('../controllers/userSetting');
const validator = require('../validators/userSetting');
const router = require('express').Router();

/*********************************
 * @Router /settings *
 *********************************/

router.post('/', validator.save, catchAsync(handler.save));

router.patch('/:key', validator.update, catchAsync(handler.update));

router.delete('/:key', validator._delete, catchAsync(handler.delete));

router.get('/', validator.getUserSettings, catchAsync(handler.getUserSettings));

module.exports = router;
