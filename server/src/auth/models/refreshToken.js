const { DataTypes } = require('sequelize');

const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class RefreshToken extends BaseModel {
	static associate() {
		RefreshToken.belongsTo(sequelize.models.User, { foreignKey: 'userId', as: 'user' });
	}

	static initialize() {
		RefreshToken.init(
			{
				uuid: {
					type: DataTypes.UUID,
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: 'RefreshToken',
				updatedAt: false,
			}
		);
	}
}

RefreshToken.register();

module.exports = RefreshToken;
