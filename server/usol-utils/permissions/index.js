const { backend } = require('usol-buffertools');
const config = require('config');

const StatusCodes = require('./../statusCodes');
backend.setOptions({
	accessDeniedCode: StatusCodes.FORBIDDEN,
	bypassPermissionCheck: config.has('bypassPermissionCheck') && config.get('bypassPermissionCheck'),
});

module.exports = {
	...backend,
	...require('./registerPermissions'),
};
