const express = require('express');
const router = express.Router();
const mal = require('./subModules/zakat-ul-mal/router');
const fitr = require('./subModules/zakat-ul-fitr/router');
const iftarMeals = require('./subModules/iftar-meals/router');
const givings = require('./subModules/giving/router');

/*********************************
 * @Router / *
 *********************************/

router.use('/zakat-ul-mal', mal);

router.use('/zakat-ul-fitr', fitr);

router.use('/iftar-meals', iftarMeals);

router.use('/givings', givings);

module.exports = router;
