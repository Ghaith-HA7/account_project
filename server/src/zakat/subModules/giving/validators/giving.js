const { body, query } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');

const save = chainBuilder([
	commonChain.stringRequired(body(['title', 'location', 'description'])),
	commonChain.arrayOptional(body('socialLinks')),
	commonChain.isInRequired(body('category'), [
		'Food/Water',
		'Mosque/Community',
		'Education',
		'Women',
		'Orphans',
		'Refugee',
		'Emergency Relief',
		'Health',
		'Creative',
		'Other',
	]),
	commonChain.integerRequired(body('funds')),
	commonChain.dateRequired(body(['startDate', 'endDate'])),
]);

const donate = chainBuilder([
	commonChain.params.id,
	commonChain.stringRequired(body('paymentMethodId')),
	body('supportAmount')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('Field value must be an decimal with value >= 0')
		.toFloat(),
	body('targetAmount').isInt({ min: 50 }).withMessage('Field value must be an decimal with value >= 50'),
]);

const update = chainBuilder([
	commonChain.params.id,
	commonChain.stringOptional(body(['title', 'location', 'description', 'img'])),
	commonChain.arrayOptional(body('socialLinks')),
	commonChain.isInOptional(body('category'), [
		'Food/Water',
		'Mosque/Community',
		'Education',
		'Women',
		'Orphans',
		'Refugee',
		'Emergency Relief',
		'Health',
		'Creative',
		'Other',
	]),
	commonChain.integerOptional(body('funds')),
	commonChain.dateOptional(body(['startDate', 'endDate'])),
]);

const paramId = chainBuilder([commonChain.params.id]);

const getList = chainBuilder([
	commonChain.pagination,
	commonChain.stringOptional(query(['title', 'location'])),
	commonChain.integerOptional(query('funds')),
]);

module.exports = {
	save,
	donate,
	update,
	paramId,
	getList,
};
