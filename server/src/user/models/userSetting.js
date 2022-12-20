const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class UserSetting extends BaseModel {
	static associate() {
		UserSetting.belongsTo(sequelize.model('User'), { foreignKey: 'userId', onDelete: 'CASCADE' });
	}

	static initialize() {
		UserSetting.init(
			{
				key: {
					type: DataTypes.STRING,
					primaryKey: true,
				},
				userId: {
					type: DataTypes.INTEGER,
					primaryKey: true,
				},
				value: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				confirmed: {
					type: DataTypes.BOOLEAN,
					defaultValue: 0,
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: 'UserSetting',
				updatedAt: false,
			}
		);
	}
}

UserSetting.register();

module.exports = UserSetting;
