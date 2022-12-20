const { DataTypes } = require('sequelize');
const adhan = require('adhan');
const phoneNumber = require('libphonenumber-js');

const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class User extends BaseModel {
	static prayerMethods = {
		MuslimWorldLeague: adhan.CalculationMethod.MuslimWorldLeague(),
		Egyptian: adhan.CalculationMethod.Egyptian(),
		Karachi: adhan.CalculationMethod.Karachi(),
		UmmAlQura: adhan.CalculationMethod.UmmAlQura(),
		Dubai: adhan.CalculationMethod.Dubai(),
		Qatar: adhan.CalculationMethod.Qatar(),
		Kuwait: adhan.CalculationMethod.Kuwait(),
		MoonsightingCommittee: adhan.CalculationMethod.MoonsightingCommittee(),
		Singapore: adhan.CalculationMethod.Singapore(),
		Turkey: adhan.CalculationMethod.Turkey(),
		Tehran: adhan.CalculationMethod.Tehran(),
		NorthAmerica: adhan.CalculationMethod.NorthAmerica(),
		Other: adhan.CalculationMethod.Other(),
	};
	static associate() {
		User.hasOne(sequelize.model('Masjid'), { foreignKey: 'adminId', onDelete: 'CASCADE' });
		User.belongsToMany(sequelize.model('Masjid'), { through: 'UserMasjidFollowship', as: 'FollowedMasjid' });
		User.hasMany(sequelize.model('MasjidEvent'), { foreignKey: 'ownerId', onDelete: 'CASCADE' });
		User.belongsToMany(sequelize.model('MasjidEvent'), {
			through: {
				model: sequelize.model('UserMasjidEvent'),
				unique: false,
			},
			foreignKey: 'userId',
		});
		User.hasMany(sequelize.model('Checkin'), { foreignKey: 'userId', onDelete: 'CASCADE' });
		User.hasMany(sequelize.model('Product'), { foreignKey: 'sellerId', as: 'soldProduct', onDelete: 'CASCADE' });
		User.hasMany(sequelize.model('UserSetting'), { foreignKey: 'userId', onDelete: 'CASCADE' });
		User.hasMany(sequelize.model('Review'), { foreignKey: 'userId', onDelete: 'CASCADE' });
		User.hasMany(sequelize.model('ZakatApply'), { foreignKey: 'userId', onDelete: 'CASCADE' });
		User.hasMany(sequelize.model('ZakatApply'), { foreignKey: 'adminId', onDelete: 'CASCADE' });
		User.hasMany(sequelize.model('Giving'), { foreignKey: 'ownerId', onDelete: 'CASCADE' });
		User.hasMany(sequelize.model('Payment'), { foreignKey: 'userId', onDelete: 'CASCADE' });
		User.hasMany(sequelize.model('UserSocialLink'), { foreignKey: 'userId', onDelete: 'CASCADE' });
	}

	static initialize() {
		User.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
					allowNull: false,
				},
				email: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				firstName: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				lastName: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				name: {
					type: new DataTypes.VIRTUAL(DataTypes.STRING, ['firstName', 'lastName']),
					get: function () {
						return this.get('firstName') + ' ' + this.get('lastName');
					},
				},
				role: {
					type: DataTypes.ENUM('user', 'admin', 'superAdmin'),
					allowNull: false,
					defaultValue: 'user',
				},
				prayerTimeMethod: {
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
				occupation: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				city: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				country: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				location: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				website: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				mobileNumber: {
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
				verificationCode: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
				stripeCustomerId: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				stripeTestCustomerId: {
					type: DataTypes.STRING,
					allowNull: true,
				},
			},
			{
				sequelize,
				indexes: [{ fields: ['mobileNumber'], unique: true }],
			}
		);
	}
}

User.register();

module.exports = User;
