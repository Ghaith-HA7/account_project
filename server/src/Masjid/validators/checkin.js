const { body, param, query } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');

const book = chainBuilder([
	commonChain.params.id,
	commonChain.integerRequired(body('prayerId')),
	commonChain.dateOptional(body('prayerDate')),
]);

const checkIn = chainBuilder([
	commonChain.params.id,
	commonChain.integerRequired(body(['hallId', 'bookId'])),
	commonChain.integerOptional(body(['prayerCode'])),
]);

const deleteCheckin = chainBuilder([commonChain.params.id, commonChain.integerRequired(body('checkinId'))]);

const getHistory = chainBuilder([commonChain.pagination, commonChain.integerOptional(query('masjidId'))]);

module.exports = {
	book,
	deleteCheckin,
	checkIn,
	getHistory,
};
