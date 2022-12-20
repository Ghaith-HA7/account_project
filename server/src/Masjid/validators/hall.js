const { body, query, param } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');
const prayers = require('../../../utils/prayers');

const save = chainBuilder([commonChain.integerRequired(body(['totalCheckins']))]);

const update = chainBuilder([
	commonChain.integerRequired(param('hallId')),
	commonChain.integerOptional(body(['totalCheckins'])),
]);

const paramId = chainBuilder([commonChain.integerRequired(param('hallId'))]);

const getMasjidHalls = chainBuilder([
	commonChain.pagination,
	commonChain.integerRequired(query('prayerId')),
	commonChain.dateOptional(query('date')),
]);

const generateRemoveCode = chainBuilder([
	commonChain.params.id,
	commonChain.integerOptional(query('hallId')),
	commonChain.integerRequired(query('prayerId')),
]);

module.exports = {
	save,
	update,
	paramId,
	getMasjidHalls,
	generateRemoveCode,
};
