const { query, body } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');

const zakat = chainBuilder([
	query([
		'cash',
		'chequingAccounts',
		'savingAccounts',
		'loansReceivables',
		'TFSAAccount',
		'RESPAssets',
		'RESPAccount',
		'otherSavingsAccounts',
		'otherCash',
		'businessValue',
		'realEstateInvestments',
		'sharesOrStocks',
		'preciousMetals',
		'otherInvestments',
		'businessDebts',
		'mortgagesOnRealEstateInvestments',
		'otherUnpaidDebts',
	])
		.exists()
		.withMessage('Field required.')
		.bail()
		.notEmpty()
		.withMessage('Empty field value.')
		.isInt({ gt: -1 })
		.withMessage('Field value must be an integer with value > 0.')
		.toInt(),
]);

const setSettings = chainBuilder([
	commonChain.floatOptional(
		body([
			'nisabMal',
			'goldPrice',
			'onePerson',
			'twoPeople',
			'threePeople',
			'fourPeople',
			'fivePeople',
			'sixPeople',
			'morePeople',
			'cpiBaseYear',
			'cpiCurrent',
			'allocationRate',
		])
	),
]);
const donate = chainBuilder([
	commonChain.stringRequired(body('paymentMethodId')),
	body('supportAmount')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('Field value must be an decimal with value >= 0')
		.toFloat(),
	body('targetAmount').isInt({ min: 50 }).withMessage('Field value must be an decimal with value >= 50'),
]);
module.exports = {
	zakat,
	setSettings,
	donate,
};
