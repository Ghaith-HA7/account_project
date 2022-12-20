const { DataTypes } = require('sequelize');
const {
	database: { sequelize, BaseModel },
} = require('usol-utils');

class MasjidEventShare extends BaseModel {
	static associate() {
		MasjidEventShare.belongsTo(sequelize.model('MasjidEvent'), { foreignKey: 'masjidEventId' });
	}

	static initialize() {
		MasjidEventShare.init(
			{},
			{
				sequelize,
				modelName: 'MasjidEventShare',
				updatedAt: false,
				indexes: [
					{
						fields: ['masjidEventId'],
					},
				],
			}
		);
	}
}

MasjidEventShare.register();

module.exports = MasjidEventShare;
