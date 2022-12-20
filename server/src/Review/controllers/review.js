const { matchedData } = require('express-validator');
const { statusCodes } = require('usol-utils');
const ReviewService = require('../services/review');

module.exports = {
	save: async (req, res) => {
		const data = matchedData(req);
		const userId = req.user.id;
		const review = await ReviewService.save({ userId, ...data });
		res.status(statusCodes.CREATED).json(review);
	},

	getAll: async (req, res) => {
		const data = await ReviewService.getAll();
		res.status(statusCodes.OK).json(data);
	},
};
