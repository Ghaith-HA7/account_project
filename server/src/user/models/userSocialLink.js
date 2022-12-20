const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class UserSocialLink extends BaseModel {
	static targetTypes = {
		Giving: 'givings',
	};
	static associate() {
		UserSocialLink.belongsTo(sequelize.model('Giving'), {
			foreignKey: 'targetId',
			constraints: false,
		});
		UserSocialLink.belongsTo(sequelize.model('User'), {
			foreignKey: 'userId',
			onDelete: 'CASCADE',
		});
	}

	static initialize() {
		UserSocialLink.init(
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
				userId: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				targetType: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				targetId: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
			},
			{
				sequelize,
				modelName: 'UserSocialLink',
				timestamps: false,
			}
		);
	}
}
UserSocialLink.register();

module.exports = UserSocialLink;
