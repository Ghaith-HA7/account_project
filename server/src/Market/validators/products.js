const { body, query } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');
const Product = require('../models/product');

// Todo: validate images as array of images
const save = chainBuilder([
	commonChain.isInRequired(body(['type']), Product.types),
	commonChain.stringRequired(body(['title', 'description'])),
	commonChain.booleanRequired(body(['isNew'])),
	commonChain.floatRequired(body(['price'])),
]);

const getAll = chainBuilder([
	commonChain.pagination,
	commonChain.isInOptional(query(['type']), Product.types),
	commonChain.booleanOptional(query(['onlyUser'])),
	commonChain.isInOptional(query(['sortByPrice', 'sortByDate']), ['DESC', 'ASC']),
	commonChain.stringOptional(query(['q'])),
]);

const update = chainBuilder([
	commonChain.params.id,
	commonChain.isInOptional(body(['type']), Product.types),
	commonChain.stringOptional(body(['title', 'description'])),
	commonChain.booleanOptional(body(['isNew'])),
	commonChain.integerOptional(body(['price'])),
]);

const updateImages = chainBuilder([commonChain.integerRequired(query('productId'))]);

const remove = chainBuilder([commonChain.params.id]);
module.exports = {
	save,
	update,
	getAll,
	delete: remove,
	updateImages,
};
