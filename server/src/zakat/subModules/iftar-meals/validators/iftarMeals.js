const { query, body } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');

const getList = chainBuilder([commonChain.dateRequired(query(['startDate', 'endDate']))]);

const setSettings = chainBuilder([
	commonChain.stringOptional(body(['title'])),
	body('goal').isDecimal().withMessage('Field must be a decimal number'),
	commonChain.booleanOptional(body('on')),
]);
const donate = chainBuilder([
	commonChain.stringRequired(body('paymentMethodId')),
	commonChain.dateRequired(query('date')),
	body('supportAmount')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('Field value must be an decimal with value >= 0')
		.toFloat(),
	body('targetAmount').isInt({ min: 50 }).withMessage('Field value must be an decimal with value >= 50'),
]);
module.exports = {
	getList,
	setSettings,
	donate,
};
