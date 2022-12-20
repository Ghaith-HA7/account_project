const router = require('express').Router();
const { catchAsync } = require('usol-utils');
/*******************
 * @Router /public *
 *******************/

const accessTokenVerifier = require('./auth/controllers/auth').accessTokenVerifier(false);

router.use(catchAsync(accessTokenVerifier));

router.use('/masjid', require('./Masjid/publicRouter'));

router.use('/masjid-event', require('./Masjid/subModules/Events/publicRouter'));

router.use('/market', require('./Market/publicRouter'));

router.use('/review', require('./Review/publicRouter'));

router.use('/payment', require('./payment/publicRouter'));

router.use(require('./zakat/publicRouter'));

module.exports = router;
