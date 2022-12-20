const ZakatSetting = require('../../../models/zakatSetting');
const _ = require('lodash');
const ZakatApplyModel = require('../../../models/zakatApply');

class ZakatService {
	static async calcFitra(members) {
		const { key, value: nisab } = await ZakatSetting.findOne({ where: { key: 'nisabFitr' } });
		const fitra = members * nisab;
		return { zakatFitrDue: Math.ceil(fitra * 100) / 100.0 };
	}

	static async setNisabFitr(value) {
		return await ZakatSetting.upsert({ key: 'nisabFitr', value });
	}

	static async applyForZakat(data, userId, assets) {
		const zakatApply = _.pick(data, ['familySize', 'totalIncome', 'gender']);
		zakatApply.userId = userId;
		zakatApply.type = 'fitr';
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
}

module.exports = ZakatService;
