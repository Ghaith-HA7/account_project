const { DataTypes } = require('sequelize');
const PaymentModel = require('../../payment/models/payment');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class Masjid extends BaseModel {
	static associate() {
		Masjid.belongsTo(sequelize.model('User'), { foreignKey: 'adminId', onDelete: 'CASCADE' });
		Masjid.hasMany(sequelize.model('Prayer'), { foreignKey: 'masjidId', as: 'prayerTimes', onDelete: 'CASCADE' });
		Masjid.belongsToMany(sequelize.model('User'), { through: 'UserMasjidFollowship', as: 'follower' });
		Masjid.hasMany(sequelize.model('Checkin'), { foreignKey: 'masjidId', onDelete: 'CASCADE' });
		Masjid.hasMany(sequelize.model('Hall'), { foreignKey: 'masjidId', onDelete: 'CASCADE' });
		Masjid.hasMany(sequelize.model('MasjidEvent'), { foreignKey: 'masjidId', onDelete: 'CASCADE', as: 'events' });
		Masjid.hasMany(sequelize.model('Payment'), {
			foreignKey: 'targetId',
			constraints: false,
			scope: {
				targetType: PaymentModel.targetTypes.Masjid,
			},
		});
	}

	static initialize() {
		Masjid.init(
			{
				name: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				customId: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				location: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				lat: {
					type: DataTypes.DECIMAL(8, 6),
					allowNull: false,
				},
				lng: {
					type: DataTypes.DECIMAL(9, 6),
					allowNull: false,
				},
				img: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				coverImg: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				method: {
					type: DataTypes.ENUM(
						'MuslimWorldLeague',
						'Egyptian',
						'Karachi',
						'UmmAlQura',
						'Dubai',
						'Qatar',
						'Kuwait',
						'MoonsightingCommittee',
						'Singapore',
						'Turkey',
						'Tehran',
						'NorthAmerica',
						'Other'
					),
					allowNull: false,
				},
				madhab: {
					type: DataTypes.ENUM('Shafi', 'Hanafi'),
					allowNull: false,
				},
				totalCheckins: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: -1,
				},
				openCheckinBefore: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: -1,
				},
				openBookingBefore: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				openBookingBefore: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: 'Masjid',
				updatedAt: false,
			}
		);
	}
}

Masjid.register();

module.exports = Masjid;
