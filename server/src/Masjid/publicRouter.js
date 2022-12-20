const { catchAsync } = require('usol-utils');
const handler = require('./controllers/masjid');
const validator = require('./validators/masjid');
const hallHandler = require('./controllers/hall');
const hallValidator = require('./validators/hall');
const router = require('express').Router();
/*********************************
 * @Router /api/public/masjid *
 *********************************/
router.use('/events', require('./subModules/Events/publicRouter'));

router.get('/:id', validator.getById, catchAsync(handler.getById));
router.get('/:id/hall', hallValidator.getMasjidHalls, catchAsync(hallHandler.getMasjidHalls));
router.get('/', validator.getList, catchAsync(handler.getList));

module.exports = router;
