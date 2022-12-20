const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class PaymentSetting extends BaseModel {
	static associate() {}
	static initialize() {
		PaymentSetting.init(
			{
				key: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false,
				},
				value: {
					type: DataTypes.STRING,
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: 'PaymentSetting',
				updatedAt: false,
			}
		);
	}
}

PaymentSetting.register();

module.exports = PaymentSetting;
