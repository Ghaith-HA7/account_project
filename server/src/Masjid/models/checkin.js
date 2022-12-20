const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class Checkin extends BaseModel {
	static associate() {
		Checkin.belongsTo(sequelize.model('User'), { foreignKey: 'userId', onDelete: 'CASCADE' });
		Checkin.belongsTo(sequelize.model('Masjid'), { foreignKey: 'masjidId', onDelete: 'CASCADE' });
		Checkin.belongsTo(sequelize.model('Hall'), { foreignKey: 'hallId', onDelete: 'CASCADE' });
		Checkin.belongsTo(sequelize.model('Prayer'), { foreignKey: 'prayerId', onDelete: 'CASCADE' });
	}

	static initialize() {
		Checkin.init(
			{
				prayerDate: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				admitted: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
			},
			{
				sequelize,
				modelName: 'Checkin',
				updatedAt: false,
			}
		);
	}
}

Checkin.register();

module.exports = Checkin;
