const { body, query } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');

const save = chainBuilder([
	commonChain.integerRequired(body(['amount', 'targetId'])),
	commonChain.isInRequired(body('target'), ['masjid']),
]);

const linkAccount = chainBuilder([
	commonChain.integerOptional(query('userId')),
	commonChain.stringRequired(body(['refreshUrl', 'returnUrl'])),
	commonChain.isInRequired(body('type'), ['zakatUlMal', 'zakatUlFtr', 'givings', 'meals', 'masjids', 'masjidEvents']),
]);

const unlinkAccount = chainBuilder([
	commonChain.integerOptional(query('userId')),
	commonChain.isInRequired(body('type'), ['zakatUlMal', 'zakatUlFtr', 'givings', 'meals', 'masjids', 'masjidEvents']),
]);

const setStripeMode = chainBuilder([commonChain.isInRequired(query('mode'), ['test', 'live'])]);

const setDefaultAppFee = chainBuilder([
	commonChain.isInRequired(body('type'), ['zakatUlMal', 'zakatUlFtr', 'givings', 'meals', 'masjids', 'masjidEvents']),
	body('percentage')
		.exists()
		.withMessage('Field required.')
		.bail()
		.notEmpty()
		.withMessage('Empty field value.')
		.isInt({ min: 0 })
		.withMessage('Field value must be an integer with value > 0.')
		.toInt(),
]);

const setAppFee = chainBuilder([
	commonChain.integerRequired(query('targetId')),
	commonChain.isInRequired(body('type'), ['zakatUlMal', 'zakatUlFtr', 'givings', 'meals', 'masjids', 'masjidEvents']),
	body('percentage')
		.exists()
		.withMessage('Field required.')
		.bail()
		.notEmpty()
		.withMessage('Empty field value.')
		.isInt({ min: 0 })
		.withMessage('Field value must be an integer with value > 0.')
		.toInt(),
]);
const getPaymentSetting = chainBuilder([
	commonChain.integerOptional(query('targetId')),
	commonChain.isInRequired(query('type'), [
		'zakatUlMal',
		'zakatUlFtr',
		'givings',
		'meals',
		'masjids',
		'masjidEvents',
	]),
]);
const getByCriteria = chainBuilder([
	commonChain.pagination,
	commonChain.isInOptional(query('targetType'), [
		'zakatUlMal',
		'zakatUlFtr',
		'givings',
		'meals',
		'masjids',
		'masjidEvents',
	]),
	commonChain.integerOptional(query('targetId')),
	commonChain.dateOptional(query('createdAt')),
]);
const getList = chainBuilder([commonChain.pagination]);

module.exports = {
	save,
	linkAccount,
	unlinkAccount,
	setStripeMode,
	setDefaultAppFee,
	setAppFee,
	getPaymentSetting,
	getList,
	getByCriteria,
};
