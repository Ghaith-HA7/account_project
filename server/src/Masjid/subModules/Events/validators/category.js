const { body, query, param } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');

const save = chainBuilder([commonChain.stringRequired(body('name'))]);
const deleteByName = chainBuilder([commonChain.stringRequired(param('name'))]);
const getList = chainBuilder(commonChain.pagination);

module.exports = {
	save,
	deleteByName,
	getList,
};
