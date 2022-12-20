const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class UserMasjidEvent extends BaseModel {
	static associate() {
		UserMasjidEvent.belongsTo(sequelize.model('MasjidEvent'), { foreignKey: 'masjidEventId' });
		UserMasjidEvent.belongsTo(sequelize.model('User'), { foreignKey: 'userId' });
	}

	static initialize() {
		UserMasjidEvent.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				date: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				numberOfFamilyMembers: {
					type: DataTypes.SMALLINT.UNSIGNED,
					allowNull: true,
				},
				authorized: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},
			},
			{
				sequelize,
				modelName: 'UserMasjidEvent',
				updatedAt: false,
			}
		);
	}
}

UserMasjidEvent.register();

module.exports = UserMasjidEvent;
