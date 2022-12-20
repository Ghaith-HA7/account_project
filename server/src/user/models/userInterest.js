const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class UserInterest extends BaseModel {
	static targetTypes = {
		Giving: 'givings',
		MasjidEvent: 'masjidEvents',
	};
	static associate() {
		UserInterest.belongsTo(sequelize.model('Giving'), {
			foreignKey: 'targetId',
			constraints: false,
		});
		UserInterest.belongsTo(sequelize.model('MasjidEvent'), {
			foreignKey: 'targetId',
			constraints: false,
		});
		UserInterest.belongsTo(sequelize.model('User'), { foreignKey: 'userId', onDelete: 'CASCADE' });
	}
	static initialize() {
		UserInterest.init(
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
					type: DataTypes.ENUM(Object.values(this.targetTypes)),
					primaryKey: true,
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: 'UserInterest',
				updatedAt: false,
			}
		);
	}
}

UserInterest.register();

module.exports = UserInterest;
