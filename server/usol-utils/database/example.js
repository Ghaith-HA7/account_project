const { Sequelize, DataTypes } = require('sequelize');

const {
	startup: { promises },
	database: { sequelize, knex, BaseModel },
} = require('./../index');

class User extends BaseModel {
	static associate() {
		console.log('hi from user1');
	}

	static initialize() {
		User.init(
			{
				firstName: {
					type: DataTypes.STRING(50),
					allowNull: false,
				},
				lastName: {
					type: DataTypes.STRING(50),
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: 'test',
			}
		);
	}
}

class User2 extends BaseModel {
	static skipSync = true;

	static associate() {
		console.log('hi from user2');
	}

	static initialize() {
		User2.init(
			{
				firstName: {
					type: DataTypes.STRING(50),
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: 'test',
			}
		);
	}
}

User.register();
User2.register();

module.exports = User;
