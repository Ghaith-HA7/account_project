const { body, param } = require('express-validator');
const {
	validator: { chainBuilder, commonChain },
} = require('usol-utils');

const save = chainBuilder([commonChain.stringRequired(body(['key', 'value']))]);

const update = chainBuilder([commonChain.stringRequired(param(['key'])), commonChain.stringRequired(body(['value']))]);

const _delete = chainBuilder([commonChain.stringRequired(param(['key']))]);

const getUserSettings = chainBuilder([commonChain.pagination]);

module.exports = {
	save,
	update,
	_delete,
	getUserSettings,
};
