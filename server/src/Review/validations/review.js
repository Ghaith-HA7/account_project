const { body } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');
const Review = require('../models/review');

const save = chainBuilder([
	commonChain.integerRequired(body(['points', 'reviewableId'])),
	body('points').isInt({ min: 1, max: 5 }),
	commonChain.stringOptional(body('comment')),
	commonChain.isInRequired(body('reviewableType'), Review.reviewableTypes),
]);

module.exports = {
	save,
};
