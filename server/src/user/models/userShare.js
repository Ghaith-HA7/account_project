const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class UserShare extends BaseModel {
	static associate() {
		UserShare.belongsTo(sequelize.model('Giving'), {
			foreignKey: 'targetId',
			constraints: false,
		});
		UserShare.belongsTo(sequelize.model('User'), {
			foreignKey: 'userId',
			onDelete: 'CASCADE',
		});
	}
	static initialize() {
		UserShare.init(
			{
				userId: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					allowNull: false,
				},
				targetId: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					allowNull: false,
				},
				targetType: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: 'UserShare',
				updatedAt: false,
			}
		);
	}
}

UserShare.register();

module.exports = UserShare;
