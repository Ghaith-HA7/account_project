const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class ZakatApply extends BaseModel {
	static associate() {
		ZakatApply.belongsTo(sequelize.model('User'), { foreignKey: 'userId' });
		ZakatApply.belongsTo(sequelize.model('User'), { foreignKey: 'adminId' });
	}

	static initialize() {
		ZakatApply.init(
			{
				type: {
					type: DataTypes.ENUM('mal', 'fitr'),
					allowNull: false,
				},
				familySize: {
					type: DataTypes.SMALLINT,
					allowNull: false,
				},
				totalCash: {
					type: DataTypes.DOUBLE,
					allowNull: true,
				},
				totalIncome: {
					type: DataTypes.DOUBLE,
					allowNull: false,
				},
				estimatedAmount: {
					type: DataTypes.DOUBLE,
					allowNull: true,
				},
				relationship: {
					type: DataTypes.ENUM('single', 'married', 'divorced', 'separated', 'widowed'),
					allowNull: true,
				},
				underEighteenChildren: {
					type: DataTypes.SMALLINT,
					allowNull: true,
				},
				rejected: {
					type: DataTypes.BOOLEAN,
					allowNull: true,
				},
				legalGivenName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				legalLastName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				spouseLegalGivenName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				spouseLegalLastName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				bankStatement: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				firstPaystub: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				secondPaystub: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				thirdPaystub: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				photoId: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				ccbNotice: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				gender: {
					type: DataTypes.ENUM('male', 'female'),
					allowNull: false,
				},
			},
			{
				sequelize,
			}
		);
	}
}

ZakatApply.register();

module.exports = ZakatApply;
