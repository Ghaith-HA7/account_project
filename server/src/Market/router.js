const express = require('express');
const router = express.Router();
const productController = require('./controllers/products');
const productValidator = require('./validators/products');
const { catchAsync } = require('usol-utils');

/*************************
 * @Router /products
 *************************/

router.post('/products', productController.upload, productValidator.save, catchAsync(productController.save));

router.patch(
	'/products/images',
	productController.upload,
	productValidator.updateImages,
	catchAsync(productController.updateImages)
);

router.patch('/products/:id', productValidator.update, catchAsync(productController.update));

router.delete('/products/:id', productValidator.delete, catchAsync(productController.delete));

module.exports = router;
