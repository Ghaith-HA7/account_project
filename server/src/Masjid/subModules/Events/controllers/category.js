const Category = require('../services/category');
const { statusCodes } = require('usol-utils');

module.exports = {
	save: async (req, res) => {
		const data = req.body;
		const result = await new Category(data).save();
		res.status(statusCodes.CREATED).json(result);
	},

	getList: async (req, res) => {
		const query = req.query;
		const result = await Category.getList(query);
		res.status(statusCodes.OK).json(result);
	},

	deleteByName: async (req, res) => {
		const { name } = req.params;
		await Category.deleteByName(name);
		res.sendStatus(statusCodes.DELETED);
	},
};
