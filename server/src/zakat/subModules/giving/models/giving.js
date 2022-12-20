const { DataTypes } = require('sequelize');
const PaymentModel = require('../../../../payment/models/payment');
const UserSocialLinkModel = require('../../../../user/models/userSocialLink');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class Giving extends BaseModel {
	static associate() {
		Giving.belongsTo(sequelize.model('User'), { foreignKey: 'ownerId', onDelete: 'CASCADE' });
		Giving.hasMany(sequelize.model('Payment'), {
			foreignKey: 'targetId',
			constraints: false,
			scope: {
				targetType: PaymentModel.targetTypes.Giving,
			},
		});
		Giving.hasMany(sequelize.model('UserInterest'), {
			foreignKey: 'targetId',
			constraints: false,
			scope: {
				targetType: sequelize.model('UserInterest').targetTypes['Giving'],
			},
			as: 'interests',
		});
		Giving.hasMany(sequelize.model('UserInterest'), {
			foreignKey: 'targetId',
			constraints: false,
			scope: {
				targetTypes: UserSocialLinkModel.targetTypes.Giving,
			},
		});
	}
	static initialize() {
		Giving.init(
			{
				title: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				category: {
					type: DataTypes.STRING,
					allowNull: false,
				},

				location: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				category: {
					type: DataTypes.ENUM(
						'Food/Water',
						'Mosque/Community',
						'Education',
						'Women',
						'Orphans',
						'Refugee',
						'Emergency Relief',
						'Health',
						'Creative',
						'Other'
					),
					allowNull: false,
				},
				img: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				startDate: {
					type: DataTypes.DATE,
					allowNull: false,
				},
				endDate: {
					type: DataTypes.DATE,
					allowNull: false,
				},
				funds: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				description: {
					type: DataTypes.STRING,
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: 'Giving',
				updatedAt: false,
			}
		);
	}
}

Giving.register();

module.exports = Giving;
