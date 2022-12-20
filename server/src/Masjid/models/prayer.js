const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class Prayer extends BaseModel {
	static associate() {
		Prayer.belongsTo(sequelize.model('Masjid'), { foreignKey: 'masjidId', onDelete: 'CASCADE' });
		Prayer.hasMany(sequelize.model('Checkin'), { foreignKey: 'prayerId', as: 'checkins', onDelete: 'CASCADE' });
		Prayer.hasMany(sequelize.model('Hall'), { foreignKey: 'prayerId', onDelete: 'CASCADE' });
	}

	static initialize() {
		Prayer.init(
			{
				prayerName: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				iqama: {
					type: DataTypes.TINYINT,
					allowNull: true,
				},
				codeIsRequired: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},
				startDate: {
					type: DataTypes.DATE,
					allowNull: true,
				},
			},
			{
				sequelize,
				modelName: 'Prayer',
				updatedAt: false,
				createdAt: false,
			}
		);
	}
}

Prayer.register();

module.exports = Prayer;
