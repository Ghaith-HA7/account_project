const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class Category extends BaseModel {
	static associate() {
		Category.hasMany(sequelize.model('MasjidEvent'), { foreignKey: 'category' });
	}

	static initialize() {
		Category.init(
			{
				name: {
					type: DataTypes.STRING,
					allowNull: false,
					primaryKey: true,
				},
			},
			{
				sequelize,
				modelName: 'Category',
				updatedAt: false,
			}
		);
	}
}

Category.register();

module.exports = Category;
