const { body } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');

const signUp = chainBuilder([
	commonChain.phoneRequired(body('mobileNumber')),
	commonChain.stringRequired(body(['firstName', 'lastName', 'occupation', 'city', 'country', 'location'])),
	commonChain.emailRequired(body('email')),
	commonChain.isInRequired(body('prayerTimeMethod'), [
		'MuslimWorldLeague',
		'Egyptian',
		'Karachi',
		'UmmAlQura',
		'Dubai',
		'Qatar',
		'Kuwait',
		'MoonsightingCommittee',
		'Singapore',
		'Turkey',
		'Tehran',
		'NorthAmerica',
		'Other',
	]),
	commonChain.isInRequired(body('madhab'), ['Shafi', 'Hanafi']),
	commonChain.stringOptional(body('website')),
	body(['lng', 'lat'])
		.exists()
		.withMessage('Field is required')
		.bail()
		.isDecimal()
		.withMessage('Field must be a decimal number'),
]);
const verify = chainBuilder([
	commonChain.integerRequired(body(['code'])),
	commonChain.phoneRequired(body('mobileNumber')),
]);
const login = chainBuilder([commonChain.phoneRequired(body(['mobileNumber']))]);

module.exports = {
	signUp,
	verify,
	login,
};
