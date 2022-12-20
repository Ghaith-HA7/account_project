const express = require('express');
const router = express.Router();
const iftarMeals = require('./subModules/iftar-meals/publicRouter');
const givings = require('./subModules/giving/publicRouter');

/*********************************
 * @Router /public *
 *********************************/

router.use('/iftar-meals', iftarMeals);
router.use('/givings', givings);

module.exports = router;
