const { body, query } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');
const prayers = require('../../../utils/prayers');

const save = chainBuilder([
	commonChain.integerRequired(body(['adminId', 'prayerTimes.*.iqama', 'totalCheckins'])),
	commonChain.stringRequired(body(['name', 'location', 'customId'])),
	commonChain.stringOptional(body(['img', 'coverImg'])),
	commonChain.isInRequired(body('madhab'), ['Shafi', 'Hanafi']),
	commonChain.isInRequired(body('method'), [
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
	commonChain.isInRequired(body('prayerTimes.*.prayerName'), prayers.names),
	body(['lat', 'lng']).isDecimal().withMessage('Field should be Decimal'),
	body(['openCheckinBefore', 'openBookingBefore'])
		.notEmpty()
		.withMessage('Empty field value.')
		.bail()
		.isInt({ min: -1 })
		.withMessage('Field value must be an integer & value >= -1.')
		.toInt(),
	commonChain.arrayRequired(body('prayerTimes')),
]);

const saveCustomPrayer = chainBuilder([
	body('prayerName')
		.exists()
		.withMessage('Field required.')
		.bail()
		.notEmpty()
		.withMessage('Empty field value.')
		.not()
		.isIn(prayers.names)
		.withMessage(`Field value must not be one of [ ${prayers.names.toString()} ].`),
	commonChain.stringRequired(body('prayerName')),
	commonChain.dateRequired(body('startDate')),
	commonChain.arrayOptional(body('hallsTotals')),
	commonChain.integerOptional(body('hallsTotals.*')),
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

const updateCustomPrayer = chainBuilder([
	commonChain.params.id,
	commonChain.stringOptional(body('prayerName')),
	commonChain.dateOptional(body('startDate')),
	commonChain.arrayOptional(body('hallsTotals')),
	commonChain.integerOptional(body('hallsTotals.*')),
]);

const updateDailyPrayer = chainBuilder([
	commonChain.params.id,
	commonChain.integerOptional(body('iqama')),
	commonChain.integerOptional(body('totalCheckins')),
]);

const update = chainBuilder([
	commonChain.params.id,
	commonChain.stringOptional(body(['name', 'location', 'customId'])),
	commonChain.isInOptional(body('madhab'), ['Shafi', 'Hanafi']),
	commonChain.isInOptional(body('method'), [
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
	commonChain.arrayOptional(body('prayerTimes')),
	commonChain.integerRequired(body('prayerTimes.*.iqama')),
	commonChain.isInRequired(body('prayerTimes.*.prayerName'), prayers.names),
	body(['lat', 'lng']).optional().isDecimal().withMessage('Field should be Decimal'),
	body(['openCheckinBefore', 'openBookingBefore'])
		.optional()
		.notEmpty()
		.withMessage('Empty field value.')
		.bail()
		.isInt({ min: -1 })
		.withMessage('Field value must be an integer & value >= -1.')
		.toInt(),
]);

const paramId = chainBuilder([commonChain.params.id]);

const getById = chainBuilder([commonChain.params.id, commonChain.dateOptional(query('date'))]);

const getList = chainBuilder([commonChain.pagination]);

module.exports = {
	save,
	saveCustomPrayer,
	donate,
	update,
	updateCustomPrayer,
	updateDailyPrayer,
	paramId,
	getList,
	getById,
};
