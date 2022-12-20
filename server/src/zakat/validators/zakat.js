const { query, body } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');

const applyForZakat = chainBuilder([
	commonChain.isInRequired(body('relationship'), ['single', 'married', 'divorced', 'separated', 'widowed']),
	body(['familySize', 'underEighteenChildren'])
		.exists()
		.withMessage('Field required.')
		.bail()
		.notEmpty()
		.withMessage('Empty field value.')
		.isInt({ gte: 0 })
		.withMessage('Field value must be an integer with value > 0.')
		.toInt(),
	body(['totalCash', 'totalIncome'])
		.exists()
		.withMessage('Field required')
		.bail()
		.isFloat({ min: 0 })
		.withMessage('Field must be a number > 0'),
	commonChain.stringRequired(body(['legalGivenName', 'legalLastName'])),
	commonChain.stringOptional(body(['spouseLegalGivenName', 'spouseLegalLastName'])),
	commonChain.isInRequired(body('gender'), ['male', 'female']),
]);
const processZakatApply = chainBuilder([commonChain.params.id, commonChain.booleanRequired(body('rejected'))]);

const estimateZakatApply = chainBuilder([
	query(['totalCash', 'totalIncome'])
		.exists()
		.withMessage('Field required')
		.bail()
		.isFloat({ min: 0 })
		.withMessage('Field must be a number > 0'),
	commonChain.integerRequired(query('familySize')),
]);

module.exports = {
	applyForZakat,
	processZakatApply,
	estimateZakatApply,
};
