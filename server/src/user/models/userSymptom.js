const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class UserSymptom extends BaseModel {
	static associate() {
		UserSymptom.belongsTo(sequelize.model('User'), { as: 'user' });
	}

	static initialize() {
		UserSymptom.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
					allowNull: false,
				},
				symptom: {
					type: DataTypes.ENUM('travelled'),
					allowNull: false,
				},
			},
			{
				sequelize,
				updatedAt: false,
			}
		);
	}
}

UserSymptom.register();

module.exports = UserSymptom;
