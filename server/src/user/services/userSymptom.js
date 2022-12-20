const UserSymptom = require('../models/userSymptom');

class UserSymptomService {
	static async create(userId, symptoms) {
		const data = [];
		symptoms.forEach((symptom) => {
			data.push({ userId, symptom });
		});
		return await UserSymptom.bulkCreate(data);
	}

	static async findLatestSymptomByUserId(userId) {
		return await UserSymptom.findOne({
			where: {
				userId,
			},
			order: [['createdAt', 'DESC']],
		});
	}
}

module.exports = UserSymptomService;
