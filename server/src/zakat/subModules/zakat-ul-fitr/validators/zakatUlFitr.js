const { query, body } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');

const fitra = chainBuilder([
	query('numberOfMembers')
		.exists()
		.withMessage('Field required.')
		.bail()
		.notEmpty()
		.withMessage('Empty field value.')
		.isInt({ gt: -1 })
		.withMessage('Field value must be an integer with value > 0.')
		.toInt(),
]);
const setNisabFitr = chainBuilder([commonChain.integerRequired(body('value'))]);
const donate = chainBuilder([
	commonChain.stringRequired(body('paymentMethodId')),
	body('supportAmount')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('Field value must be an decimal with value >= 0')
		.toFloat(),
	body('targetAmount').isInt({ min: 50 }).withMessage('Field value must be an decimal with value >= 50'),
]);

const applyForZakat = chainBuilder([
	body(['familySize'])
		.exists()
		.withMessage('Field required.')
		.bail()
		.notEmpty()
		.withMessage('Empty field value.')
		.isInt({ gte: 0 })
		.withMessage('Field value must be an integer with value > 0.')
		.toInt(),
	body(['totalIncome'])
		.exists()
		.withMessage('Field required')
		.bail()
		.isFloat({ min: 0 })
		.withMessage('Field must be a number > 0'),
	commonChain.isInRequired(body('gender'), ['male', 'female']),
]);

module.exports = {
	fitra,
	setNisabFitr,
	donate,
	applyForZakat,
};
