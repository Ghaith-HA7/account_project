const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class Payment extends BaseModel {
	static targetTypes = {
		ZakatUlMal: 'zakatUlMal',
		ZakatUlFtr: 'zakatUlFtr',
		Meals: 'meals',
		Giving: 'givings',
		Masjid: 'masjids',
		MasjidEvent: 'masjidEvents',
	};
	static associate() {
		Payment.belongsTo(sequelize.model('Giving'), {
			foreignKey: 'targetId',
			constraints: false,
		});
		Payment.belongsTo(sequelize.model('Masjid'), {
			foreignKey: 'targetId',
			constraints: false,
		});
		Payment.belongsTo(sequelize.model('MasjidEvent'), {
			foreignKey: 'targetId',
			constraints: false,
		});
		Payment.belongsTo(sequelize.model('User'), {
			foreignKey: 'userId',
			onDelete: 'CASCADE',
		});
	}

	static initialize() {
		Payment.init(
			{
				paymentStripeId: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false,
				},
				userId: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				targetId: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
				targetType: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				targetAmount: {
					type: DataTypes.DECIMAL,
					allowNull: false,
				},
				muslimAmount: {
					type: DataTypes.DECIMAL,
					allowNull: true,
				},
				confirmed: {
					type: DataTypes.BOOLEAN,
					defaultValue: 0,
					allowNull: false,
				},
				date: {
					type: DataTypes.DATE,
					allowNull: true,
				},
			},
			{
				sequelize,
				modelName: 'Payment',
			}
		);
	}
}

Payment.register();

module.exports = Payment;
