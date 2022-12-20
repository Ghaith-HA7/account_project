const express = require('express');
const router = express.Router();
const productController = require('./controllers/products');
const productValidator = require('./validators/products');
const { catchAsync } = require('usol-utils');

/*************************
 * @Router /products
 *************************/

router.get('/products', productValidator.getAll, catchAsync(productController.getAll));

module.exports = router;
