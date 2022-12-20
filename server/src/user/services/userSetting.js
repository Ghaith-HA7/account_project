const UserSettingModel = require('../models/userSetting');
const { Exception, statusCodes } = require('usol-utils');

class UserSetting {
	constructor(data) {
		this.key = data.key;
		this.value = data.value;
	}

	async save(userId) {
		const key = this.key;
		const setting = await UserSettingModel.findOne({
			where: {
				userId,
				key,
			},
		});
		if (setting) throw new Exception(statusCodes.DUPLICATED_ENTRY);
		const userSetting = await UserSettingModel.create({ ...this, userId });
		return { data: { key: userSetting.key, value: userSetting.value } };
	}

	async update(userId, key) {
		const setting = await UserSetting.find(userId, key);
		await setting.update({ value: this.value });
	}

	static async delete(userId, key) {
		const setting = await UserSetting.find(userId, key);
		await setting.destroy({
			where: {
				userId,
				key,
			},
		});
	}

	static async getUserSettings(userId, { limit, offset }) {
		const { count: totalRecords, rows: data } = await UserSettingModel.findAndCountAll({
			where: {
				userId,
			},
			offset,
			limit,
		});
		return { totalRecords, data };
	}

	static async find(userId, key) {
		const setting = await UserSettingModel.findOne({
			where: {
				userId,
				key,
			},
		});
		if (!setting) throw new Exception(statusCodes.ITEM_NOT_FOUND);
		return setting;
	}
}

module.exports = UserSetting;
