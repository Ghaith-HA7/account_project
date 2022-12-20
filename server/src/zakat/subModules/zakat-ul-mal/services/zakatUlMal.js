const axios = require('axios');
const cc = require('currency-codes');
const {
	Exception,
	statusCodes,
	database: { sequelize, Sequelize },
} = require('usol-utils');
const UserService = require('../../../../user/services/user');

const _ = require('lodash');
const { Op } = require('sequelize');

class ZakatService {
	constructor(data) {
		this.cashAndEquivalents = _.pick(data, [
			'cash',
			'chequingAccounts',
			'savingAccounts',
			'loansReceivables',
			'TFSAAccount',
			'RESPAssets',
			'RESPAccount',
			'otherSavingsAccounts',
			'otherCash',
		]);
		this.businessAndInvestments = _.pick(data, [
			'businessValue',
			'realEstateInvestments',
			'sharesOrStocks',
			'preciousMetals',
			'otherInvestments',
		]);
		this.liabilities = _.pick(data, ['businessDebts', 'mortgagesOnRealEstateInvestments', 'otherUnpaidDebts']);
	}

	static Settings = {
		pay: {
			nisabMal: 'nisabMal',
			goldPrice: 'goldPrice',
		},
		apply: {
			onePerson: 'onePerson',
			twoPeople: 'twoPeople',
			threePeople: 'threePeople',
			fourPeople: 'fourPeople',
			fivePeople: 'fivePeople',
			sixPeople: 'sixPeople',
			morePeople: 'morePeople',
			cpiBaseYear: 'cpiBaseYear',
			cpiCurrent: 'cpiCurrent',
			allocationRate: 'allocationRate',
		},
	};

	static async getPrices(metal, country) {
		let type = metal === 'gold' ? 'XAU' : 'XAG';
		const currency = cc.country(country)[0] ? cc.country(country)[0].code : 'CAD';
		let res = await axios.get(`https://www.goldapi.io/api/${type}/${currency}`, {
			headers: {
				'x-access-token': 'goldapi-1d52ouklwhjfkq-io',
				'Content-Type': 'application/json',
			},
		});
		if (!res.data.price) throw new Exception(statusCodes.BAD_REQUEST, 'Invalid nisab type or user country');
		return { price: res.data.price / 31.1034, currency };
	}

	static async calcNisab(type, country) {
		let grams = type === 'gold' ? 85 : 595;
		let prices = await ZakatService.getPrices(type, country);
		return { value: prices.price * grams, currency: prices.currency, pricePerGram: prices.price };
	}

	async calcZakat() {
		const totalAssets = Object.values({ ...this.cashAndEquivalents, ...this.businessAndInvestments }).reduce(
			(pr, cur) => pr + cur
		);
		const totalLiabilities = Object.values(this.liabilities).reduce((pr, cur) => pr + cur);
		const netAssets = totalAssets - totalLiabilities;
		const settings = await sequelize
			.model('ZakatSetting')
			.findAll({ where: { key: { [Op.in]: Object.values(ZakatService.Settings.pay) } } });
		const { value: nisab } = settings.find((e) => e.key === ZakatService.Settings.pay.nisabMal);
		const { value: goldPrice } = settings.find((e) => e.key === ZakatService.Settings.pay.goldPrice);

		if (!nisab || !goldPrice)
			throw new Exception(statusCodes.INVALID_OPERATION, 'settings is not provided by admin');
		const zakatableAmount = netAssets >= nisab * goldPrice ? netAssets : 0;
		const zakatDue = zakatableAmount * 0.025;
		return { totalAssets, totalLiabilities, netAssets, zakatableAmount, zakatDue };
	}

	static async setSettings(data) {
		const settingsKeys = { ...this.Settings.pay, ...this.Settings.apply };
		const settings = _.pick(data, Object.keys(settingsKeys));
		return await Promise.all(
			Object.entries(settings).map(
				async ([key, value]) => await sequelize.model('ZakatSetting').upsert({ key: settingsKeys[key], value })
			)
		);
	}
	static async getSettings() {
		const settingsKeys = { ...this.Settings.pay, ...this.Settings.apply };
		const settings = await sequelize
			.model('ZakatSetting')
			.findAll({ where: { key: { [Op.in]: Object.values(settingsKeys) } } });
		const settingsObject = {};
		for (const { key, value } of settings) {
			settingsObject[key] = value;
		}
		const result = {};
		for (const [key, value] of Object.entries(settingsKeys)) result[key] = settingsObject[value];
		return result;
	}
}

module.exports = ZakatService;
