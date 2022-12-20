const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');
const Masjid = require('./masjid');

class Hall extends BaseModel {
	static associate() {
		Hall.belongsTo(sequelize.model('Masjid'), { foreignKey: 'masjidId', onDelete: 'CASCADE' });
		Hall.hasMany(sequelize.model('Checkin'), { foreignKey: 'hallId', as: 'checkins', onDelete: 'CASCADE' });
		Hall.belongsTo(sequelize.model('Prayer'), { foreignKey: 'prayerId', onDelete: 'CASCADE' });
	}

	static initialize() {
		Hall.init(
			{
				masjidId: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				totalCheckins: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				prayerCode: {
					type: DataTypes.TINYINT,
					allowNull: true,
				},
				daily: {
					type: DataTypes.BOOLEAN,
					allowNull: true,
					defaultValue: false,
				},
			},
			{
				sequelize,
				modelName: 'Hall',
				updatedAt: false,
				name: { singular: 'hall', plural: 'halls' },
			}
		);
	}
}

Hall.register();

module.exports = Hall;
