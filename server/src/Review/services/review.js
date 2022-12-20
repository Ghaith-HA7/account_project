const {
	Exception,
	statusCodes,
	database: { sequelize },
} = require('usol-utils');
const Review = require('../models/review');

class ReviewService {
	static async save(data) {
		const review = await Review.create(data);
		return { data: { id: review.id } };
	}

	static async getAll() {
		let review = await Review.findAll({
			include: [{ model: sequelize.model('Product') }],
		});
		const result = [];
		for (const rev of review) {
			const reviewable = rev.reviewable.toJSON();
			result.push({ ...rev.toJSON(), reviewable });
		}
		return result;
	}
}

module.exports = ReviewService;
