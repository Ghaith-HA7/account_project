const { DataTypes, INTEGER } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class Review extends BaseModel {
	static reviewableTypes = ['Product'];

	static associate() {
		// todo: add user relation
		Review.belongsTo(sequelize.model('User'), { foreignKey: 'userId' });
		Review.belongsTo(sequelize.model('Product'), {
			foreignKey: 'reviewableId',
			constraints: false,
		});

		Review.addHook('afterFind', (findResult) => {
			if (!Array.isArray(findResult)) findResult = [findResult];
			for (const instance of findResult)
				if (instance.reviewableType === 'Product' && instance.Product !== undefined) {
					instance.reviewable = instance.Product;
					// To prevent mistakes:
					delete instance.Product;
					delete instance.dataValues.Product;
				}
		});
	}

	static initialize() {
		Review.init(
			{
				points: {
					allowNull: false,
					type: DataTypes.INTEGER,
				},
				comment: {
					type: DataTypes.TEXT,
				},
				reviewableId: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				reviewableType: {
					type: DataTypes.ENUM,
					values: Review.reviewableTypes,
				},
			},
			{
				sequelize,
				modelName: 'Review',
				updatedAt: false,
			}
		);
	}
}

Review.register();

module.exports = Review;
