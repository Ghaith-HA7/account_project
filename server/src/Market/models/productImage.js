const { DataTypes } = require('sequelize');

const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class ProductImage extends BaseModel {
	static associate() {
		ProductImage.belongsTo(sequelize.model('Product'), { foreignKey: 'productId', onDelete: 'CASCADE' });
	}

	static initialize() {
		ProductImage.init(
			{
				url: {
					type: DataTypes.TEXT,
				},
			},
			{
				sequelize,
				modelName: 'ProductImage',
				updatedAt: false,
			}
		);
	}
}

ProductImage.register();

module.exports = ProductImage;
