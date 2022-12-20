const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class ZakatSetting extends BaseModel {
	static associate() {}

	static initialize() {
		ZakatSetting.init(
			{
				key: {
					type: DataTypes.STRING,
					primaryKey: true,
				},
				value: {
					type: DataTypes.STRING,
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: 'ZakatSetting',
				updatedAt: false,
			}
		);
	}
}

ZakatSetting.register();

module.exports = ZakatSetting;
