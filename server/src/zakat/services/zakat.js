const {
	Exception,
	statusCodes,
	database: { sequelize, Sequelize },
} = require('usol-utils');
const _ = require('lodash');
const ZakatApplyModel = require('../models/zakatApply');
const ZakatSetting = require('../models/zakatSetting');
const ZakatUlMalService = require('../subModules/zakat-ul-mal/services/zakatUlMal');
class ZakatService {
	static Settings = ZakatUlMalService.Settings.apply;

	static async estimateZakatApply(data) {
		const { familySize, totalCash, totalIncome } = data;
		let currentLICO = 0;
		if (familySize > 0) {
			let key;
			switch (familySize) {
				case 1:
					key = ZakatService.Settings.onePerson;
					break;
				case 2:
					key = ZakatService.Settings.twoPeople;
					break;
				case 3:
					key = ZakatService.Settings.threePeople;
					break;
				case 4:
					key = ZakatService.Settings.fourPeople;
					break;
				case 5:
					key = ZakatService.Settings.fivePeople;
					break;
				case 6:
					key = ZakatService.Settings.sixPeople;
					break;
				default:
					key = ZakatService.Settings.morePeople;
					break;
			}
			currentLICO = (await ZakatSetting.findOne({ where: { key } })).value;
		}
		const cpiBaseYear = (await ZakatSetting.findOne({ where: { key: ZakatService.Settings.cpiBaseYear } })).value;
		const cpiCurrent = (await ZakatSetting.findOne({ where: { key: ZakatService.Settings.cpiCurrent } })).value;
		const allocationRate = (await ZakatSetting.findOne({ where: { key: ZakatService.Settings.allocationRate } }))
			.value;
		const maximum = (((currentLICO * cpiCurrent) / cpiBaseYear) * allocationRate) / 12;
		let estimatedAmount = 0;
		if (maximum - totalCash - totalIncome > 0) {
			estimatedAmount = Math.round(maximum - totalCash - totalIncome, 0);
		}
		return estimatedAmount;
	}

	static async applyForZakat(data, userId, assets, type) {
		const zakatApply = _.pick(data, [
			'relationship',
			'familySize',
			'totalIncome',
			'totalCash',
			'legalGivenName',
			'legalLastName',
			'gender',
			'spouseLegalGivenName',
			'spouseLegalLastName',
			'underEighteenChildren',
		]);
		zakatApply.userId = userId;
		zakatApply.type = type;
		zakatApply.estimatedAmount = await ZakatService.estimateZakatApply(data);
		if (assets) {
			if (assets.bankStatement && assets.bankStatement[0]) zakatApply.bankStatement = assets.bankStatement[0].url;
			if (assets.firstPaystub && assets.firstPaystub[0]) zakatApply.firstPaystub = assets.firstPaystub[0].url;
			if (assets.secondPaystub && assets.secondPaystub[0]) zakatApply.secondPaystub = assets.secondPaystub[0].url;
			if (assets.thirdPaystub && assets.thirdPaystub[0]) zakatApply.thirdPaystub = assets.thirdPaystub[0].url;
			if (assets.photoId && assets.photoId[0]) zakatApply.photoId = assets.photoId[0].url;
			if (assets.ccbNotice && assets.ccbNotice[0]) zakatApply.ccbNotice = assets.ccbNotice[0].url;
		}
		return await ZakatApplyModel.create(zakatApply);
	}
	static async processZakatApply(id, data, user, type) {
		const zakatApply = _.pick(data, ['rejected']);
		zakatApply.adminId = user.id;
		return await ZakatApplyModel.update(zakatApply, { where: { id, type } });
	}

	static async zakatRequests(type) {
		return await ZakatApplyModel.findAll({ where: { rejected: { [Sequelize.Op.eq]: null }, type } });
	}

	static async myRequests(userId, type) {
		return await ZakatApplyModel.findAll({ where: { userId, type } });
	}
}

module.exports = ZakatService;
