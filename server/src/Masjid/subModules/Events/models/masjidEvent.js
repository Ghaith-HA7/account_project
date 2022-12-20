const { DataTypes } = require('sequelize');
const config = require('config');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');
const UserInterest = require('../../../../user/models/userInterest');
const PaymentModel = require('../../../../payment/models/payment');
let currentDomain;
if (config.has('currentDomain')) {
	currentDomain = config.get('currentDomain');
} else console.warn('Missing currentDomain config');

class MasjidEvent extends BaseModel {
	static associate() {
		MasjidEvent.belongsTo(sequelize.model('Masjid'), { foreignKey: 'masjidId', onDelete: 'CASCADE' });
		MasjidEvent.belongsTo(sequelize.model('User'), { foreignKey: 'ownerId', onDelete: 'CASCADE' });
		MasjidEvent.belongsToMany(sequelize.model('User'), {
			through: {
				model: sequelize.model('UserMasjidEvent'),
				unique: false,
			},
			foreignKey: 'masjidEventId',
			as: 'goingUsers',
		});
		MasjidEvent.hasMany(sequelize.model('MasjidEventShare'), { foreignKey: 'masjidEventId', onDelete: 'CASCADE' });
		MasjidEvent.belongsTo(sequelize.model('Category'), { foreignKey: 'category' });
		MasjidEvent.hasMany(sequelize.model('UserInterest'), {
			foreignKey: 'targetId',
			constraints: false,
			scope: {
				targetType: UserInterest.targetTypes.MasjidEvent,
			},
			as: 'interests',
		});
		MasjidEvent.hasMany(sequelize.model('Payment'), {
			foreignKey: 'targetId',
			constraints: false,
			scope: {
				targetType: PaymentModel.targetTypes.MasjidEvent,
			},
		});
	}

	static initialize() {
		MasjidEvent.init(
			{
				title: {
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
				location: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				description: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
				sheikhName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				fee: {
					type: DataTypes.SMALLINT,
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
				dailyRenew: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				img: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				attachmentUrl: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				total: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: 'MasjidEvent',
				updatedAt: false,
			}
		);
	}
}

MasjidEvent.register();

module.exports = MasjidEvent;
