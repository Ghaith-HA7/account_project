const router = require('express').Router();

/*******************
 * @Router /       *
 *******************/

router.use('/masjid', require('./Masjid/router'));

router.use('/user', require('./user/router'));

router.use(require('./zakat/router'));

router.use('/market', require('./Market/router'));

router.use('/payment', require('./payment/router'));

router.use('/review', require('./Review/router'));

router.use('/booking', require('./booking/router'));

module.exports = router;
