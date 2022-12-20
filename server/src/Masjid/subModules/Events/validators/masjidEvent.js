const { body, query, param } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');

const save = chainBuilder([
	body(['total'])
		.exists()
		.withMessage('Field required.')
		.bail()
		.notEmpty()
		.withMessage('Empty field value.')
		.isInt({ min: -1 })
		.withMessage('Field value must be an integer with value > 0.')
		.toInt(),
	commonChain.integerOptional(body(['fee', 'masjidId'])),
	commonChain.stringRequired(body(['category', 'title', 'description'])),
	commonChain.stringOptional(body(['sheikhName', 'location'])),
	commonChain.dateRequired(body(['startDate', 'endDate'])),
	commonChain.booleanOptional(body('dailyRenew')),
	body(['lat', 'lng']).isDecimal().withMessage('Field should be Decimal'),
]);

const registerUser = chainBuilder([
	commonChain.params.id,
	commonChain.arrayOptional(body('dates')),
	commonChain.dateRequired(body('dates.*')),
	commonChain.integerOptional(body('numberOfFamilyMembers')),
	commonChain.stringOptional(body('paymentMethodId')),
	body('supportAmount')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('Field value must be an decimal with value >= 0')
		.toFloat(),
]);

const paramId = chainBuilder([commonChain.params.id]);

const getList = chainBuilder([
	commonChain.pagination,
	commonChain.integerOptional(query('masjidId')),
	commonChain.stringOptional(query('category')),
	commonChain.dateOptional(query(['startDate', 'endDate', 'date'])),
	query(['lng', 'lat']).optional().isDecimal().withMessage('Field must be a decimal number'),
]);

const share = chainBuilder([commonChain.params.id]);

module.exports = {
	save,
	registerUser,
	paramId,
	getList,
	share,
};
