/**
 * @type {Array<{moduleKey: {name: String, description: String, submodules: {submoduleKey: {name: String, description: String, permissions: {permissionKey: String, name: String, description: String}}}}, moduleKey2: {name: String, description: String, submodules: {submoduleKey2: {name: String, description: String, permissions: {permissionKey2: String, name: String, description: String}}}}}>}
 */
const allPermissions = [];

/**
 * @type {{moduleKey: {name: String, description: String, submodules: {submoduleKey: {name: String, description: String, permissions: {permissionKey: String, name: String, description: String}}}}, moduleKey2: {name: String, description: String, submodules: {submoduleKey2: {name: String, description: String, permissions: {permissionKey2: String, name: String, description: String}}}}}}
 */
const mergedPermissions = {};

/**
 * @type {{key1: {index: Number, name: String, description: String, moduleIndex?: Number, submoduleIndex?: Number}},{key2: {index: Number, name: String, description: String, moduleIndex?: Number, submoduleIndex?: Number}}}
 */
const flatPermissions = {};

/**
 *
 * @param {object} permissions
 * @param {object} [permissions.moduleKey]
 * @param {string} [permissions.moduleKey.name]
 * @param {string} [permissions.moduleKey.description]
 * @param {object} [permissions.moduleKey.submodules]
 * @param {object} [permissions.moduleKey.submodules.submoduleKey]
 * @param {string} [permissions.moduleKey.submodules.submoduleKey.name]
 * @param {object} [permissions.moduleKey.submodules.submoduleKey.permissions]
 * @param {object} [permissions.moduleKey.submodules.submoduleKey.permissions.permissionKey]
 * @param {string} [permissions.moduleKey.submodules.submoduleKey.permissions.permissionKey.name]
 */
function registerPermissions(permissions) {
	Object.entries(permissions).forEach(([key, value]) => {
		if (!value.name) value.name = key;
		if (value.submodules) {
			Object.entries(value.submodules).forEach(([key, value]) => {
				if (!value.name) value.name = key;
				if (value.permissions) {
					Object.entries(value.permissions).forEach(([key, value]) => {
						if (!value.name) value.name = key;
					});
				} else {
					value.permissions = {};
				}
			});
		} else {
			value.submodules = {};
		}
	});
	allPermissions.push(permissions);
}

module.exports = {
	allPermissions,
	mergedPermissions,
	flatPermissions,
	registerPermissions,
};
