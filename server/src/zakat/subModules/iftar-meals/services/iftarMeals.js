const {
	Exception,
	statusCodes,
	database: { sequelize, Sequelize },
} = require('usol-utils');
const Payment = require('../../../../payment/models/payment');

class IftarMealService {
	constructor(data) {}

	static Settings = {
		title: 'titleMeal',
		goal: 'goalMeal',
		on: 'onMeal',
	};

	static async setSettings(data) {
		const settings = _.pick(data, Object.keys(this.Settings));
		return await Promise.all(
			Object.entries(settings).map(
				async ([key, value]) => await sequelize.model('ZakatSetting').upsert({ key: this.Settings[key], value })
			)
		);
	}

	static async getSettings() {
		const settings = await sequelize
			.model('ZakatSetting')
			.findAll({ where: { key: { [Sequelize.Op.in]: Object.values(this.Settings) } } });
		const settingsObject = {};
		for (const { key, value } of settings) {
			settingsObject[key] = value;
		}
		const result = {};
		for (const [key, value] of Object.entries(this.Settings))
			result[key] =
				!isNaN(settingsObject[value]) && !isNaN(parseFloat(settingsObject[value]))
					? Number(settingsObject[value])
					: settingsObject[value];
		return result;
	}

	static async getList(query) {
		const { startDate, endDate } = query;
		let where = {
			date: { [Sequelize.Sequelize.Op.between]: [startDate, endDate] },
			confirmed: true,
			targetType: Payment.targetTypes.Meals,
		};
		const donations = await sequelize.model('Payment').findAll({
			attributes: [
				[Sequelize.literal(`DATE(date)`), 'donationDate'],
				[Sequelize.literal(`SUM(targetAmount)`), 'currentAmount'],
			],
			where,
			group: ['donationDate'],
		});
		const result = {};
		result.donations = donations.map((row) => ({
			currentAmount: Number(row.toJSON().currentAmount),
			donationDate: new Date(row.toJSON().donationDate),
		}));
		result.settings = await IftarMealService.getSettings();

		return result;
	}
}

module.exports = IftarMealService;
