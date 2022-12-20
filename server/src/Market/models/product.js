const { DataTypes } = require('sequelize');

const {
	database: { sequelize, BaseModel },
} = require('usol-utils');
class Product extends BaseModel {
	static types = ['electronics', 'clothes', 'others'];

	static associate() {
		Product.belongsTo(sequelize.model('User'), { foreignKey: 'sellerId', as: 'seller' });
		Product.hasMany(sequelize.model('ProductImage'), { foreignKey: 'productId', onDelete: 'CASCADE' });
		Product.hasMany(sequelize.model('Review'), {
			foreignKey: 'reviewableId',
			constraints: false,
			scope: {
				reviewableType: 'Product',
			},
		});
	}

	static initialize() {
		Product.init(
			{
				type: {
					type: DataTypes.ENUM,
					values: Product.types,
					allowNull: false,
				},
				title: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				description: { type: DataTypes.STRING },
				isNew: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
				},
				price: {
					type: DataTypes.FLOAT,
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: 'Product',
				updatedAt: false,
			}
		);
	}
}

Product.register();

module.exports = Product;
