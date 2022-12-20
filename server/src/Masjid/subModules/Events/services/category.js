const {
	Exception,
	statusCodes,
	database: { sequelize, Sequelize },
} = require('usol-utils');
const CategoryModel = require('../models/category');

class Category {
	constructor(data) {
		this.name = data.name;
	}
	async save() {
		const category = await CategoryModel.findByPk(this.name);
		if (category) throw new Exception(statusCodes.DUPLICATED_ENTRY);
		return await CategoryModel.create(this);
	}

	static async deleteByName(name) {
		return CategoryModel.destroy({ where: { name } });
	}

	static async getList({ limit, offset }) {
		const { count: totalRecords, rows: data } = await CategoryModel.findAndCountAll({
			offset,
			limit,
		});
		return { totalRecords, data };
	}
}

module.exports = Category;
