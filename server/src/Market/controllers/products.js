const ProductService = require('../services/products');
const { statusCodes } = require('usol-utils');
const { matchedData } = require('express-validator');
const { genUploader } = require('../../../utils');

module.exports = {
	save: async (req, res) => {
		const validatedData = { ...matchedData(req), sellerId: req.user.id };
		const product = await ProductService.save(validatedData);
		res.status(statusCodes.CREATED).json(product);
	},

	getAll: async (req, res) => {
		const { limit, offset, total, ...rest } = req.query;
		const products = await ProductService.getAll(rest, { limit, offset, total }, req.user.id);
		res.status(statusCodes.OK).json(products);
	},

	update: async (req, res) => {
		const validatedData = { ...matchedData(req) };
		await ProductService.update(validatedData, req.params.id, req.user.id);
		res.sendStatus(statusCodes.UPDATED);
	},

	delete: async (req, res) => {
		const id = req.params.id;
		await ProductService.delete(id, req.user.id, req.user.role);
		res.sendStatus(statusCodes.DELETED);
	},

	upload: genUploader({
		fields: [{ name: 'file', maxCount: 3 }],
		maxFileSize: 5,
		allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif'],
		directoryName: 'productImages',
	}),

	updateImages: async (req, res) => {
		const files = res.locals.assets.file;
		const productId = req.query.productId;
		const userId = req.user.id;
		const result = await ProductService.updateImages(files, productId, userId);
		res.status(statusCodes.UPDATED).json(result);
	},
};
