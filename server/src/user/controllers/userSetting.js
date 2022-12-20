const _ = require('lodash');
const UserSettingService = require('../services/userSetting');
const { statusCodes } = require('usol-utils');

module.exports = {
	/** Add a new user setting */
	save: async (req, res) => {
		const data = req.body;
		const userId = req.user.id;
		const result = await new UserSettingService(data).save(userId);
		res.status(statusCodes.CREATED).json(result);
	},

	/** Update user setting */
	update: async (req, res) => {
		const { key } = req.params;
		const userId = req.user.id;
		const data = req.body;
		await new UserSettingService(data).update(userId, key);
		res.sendStatus(statusCodes.UPDATED);
	},

	/** Delete a user setting */
	delete: async (req, res) => {
		const { key } = req.params;
		const userId = req.user.id;
		await UserSettingService.delete(userId, key);
		res.sendStatus(statusCodes.DELETED);
	},

	/** Get user settings */
	getUserSettings: async (req, res) => {
		const pagination = _.pick(req.query, ['limit', 'offset']);
		const userId = req.user.id;
		const result = await UserSettingService.getUserSettings(userId, pagination);
		res.status(statusCodes.OK).json(result);
	},
};
