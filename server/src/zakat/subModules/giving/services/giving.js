const GivingModel = require('../models/giving');
const UserInterestModel = require('../../../../user/models/userInterest');
const UserShareModel = require('../../../../user/models/userShare');
const UserSocialLinkModel = require('../../../../user/models/userSocialLink');
const { Op } = require('sequelize');
const {
	Exception,
	statusCodes,
	database: { sequelize },
} = require('usol-utils');
const Payment = require('../../../../payment/models/payment');

class Giving {
	constructor(data) {
		this.title = data.title;
		this.category = data.category;
		this.location = data.location;
		this.startDate = data.startDate;
		this.endDate = data.endDate;
		this.funds = data.funds;
		this.description = data.description;
		this.socialLinks =
			(data.socialLinks &&
				data.socialLinks.map((socialLink) => {
					socialLink = JSON.parse(socialLink);
					return {
						key: socialLink.key,
						value: socialLink.value,
					};
				})) ||
			null;
	}
	async save(ownerId, asset) {
		let result = await sequelize.transaction(async (trx) => {
			let giving;
			const { socialLinks, ...data } = this;

			if (asset.file) {
				let img = asset.file[0].url;
				giving = await GivingModel.create({ ...data, img, ownerId });
			} else {
				giving = await GivingModel.create({ ...data, ownerId });
			}
			let temp = [];
			if (socialLinks) {
				for (const socialLink of socialLinks) {
					temp.push(socialLink);
				}
				temp = socialLinks.map((socialLink) => ({
					...socialLink,
					userId: ownerId,
					targetId: giving.id,
					targetType: UserSocialLinkModel.targetTypes.Giving,
				}));
			}
			await UserSocialLinkModel.destroy({
				where: {
					targetId: giving.id,
					targetType: UserSocialLinkModel.targetTypes.Giving,
					userId: ownerId,
				},
			});
			await UserSocialLinkModel.bulkCreate(temp);
			return { id: giving.id };
		});

		return { data: result };
	}

	static async saveUserShare(userId, givingId) {
		const data = await sequelize.transaction(async (trx) => {
			const giving = await GivingModel.findByPk(givingId);
			if (!giving) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			return await UserShareModel.create({
				userId,
				targetId: givingId,
				targetType: 'givings',
			});
		});
		return { data };
	}

	async update(id, user) {
		const data = await sequelize.transaction(async (trx) => {
			const giving = await GivingModel.findByPk(id);
			if (!giving) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			if (user.role !== 'superAdmin' && giving.userId !== user.id)
				throw new Exception(statusCodes.FORBIDDEN, 'user is not allowed to perform this action');
			if (this.socialLinks) {
				await Promise.all(
					this.socialLinks.map(async (socialLink) => {
						// check if social link is existed to update or create new one
						const link = await UserSocialLinkModel.findOne({
							where: {
								targetId: id,
								targetType: UserSocialLinkModel.targetTypes.Giving,
								key: socialLink.key,
							},
						});
						if (link) {
							await link.update({
								value: socialLink.value,
							});
						} else {
							await UserSocialLinkModel.create({
								...socialLink,
								userId: giving.ownerId,
								targetId: id,
								targetType: UserSocialLinkModel.targetTypes.Giving,
							});
						}
					})
				);
			}
			return await giving.update({ ...this });
		});
		return { data };
	}

	static async updateAttachment(id, user, asset) {
		const data = await sequelize.transaction(async (trx) => {
			const img = asset.file[0].url;
			const giving = await GivingModel.findByPk(id);
			if (!giving) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			if (user.role !== 'superAdmin' && giving.userId !== user.id)
				throw new Exception(statusCodes.FORBIDDEN, 'user is not allowed to perform this action');
			return await giving.update({ img });
		});
		return { data };
	}

	static async delete(id, user) {
		await sequelize.transaction(async (trx) => {
			const giving = await GivingModel.findByPk(id);
			if (!giving) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			if (user.role !== 'superAdmin' && giving.userId !== user.id)
				throw new Exception(statusCodes.FORBIDDEN, 'user is not allowed to perform this action');
			await giving.destroy();
		});
	}

	static async deleteUserShare(id, userId) {
		await sequelize.transaction(async (trx) => {
			const share = await UserShareModel.findOne({
				where: {
					userId,
					targetId: id,
					targetType: 'givings',
				},
			});
			if (!share) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			await share.destroy();
		});
	}

	static async getById(user, id) {
		const giving = await GivingModel.findByPk(id, {
			attributes: {
				include: [[sequelize.fn('COUNT', sequelize.col('Payments.paymentStripeId')), 'donors']],
			},
			include: [
				{
					model: Payment,
					attributes: [],
					required: false,
				},
			],
		});
		if (!giving) throw new Exception(statusCodes.ITEM_NOT_FOUND);
		const socialLinks = await UserSocialLinkModel.findAll({
			where: {
				targetId: id,
			},
			attributes: ['key', 'value'],
		});
		const interested = await UserInterestModel.count({
			where: {
				targetId: id,
				targetType: UserInterestModel.targetTypes.Giving,
			},
		});
		const result = { interested, ...giving.toJSON(), socialLinks };
		if (user) {
			result.isInterested = !!(await UserInterestModel.findOne({
				where: { targetId: id, targetType: UserInterestModel.targetTypes.Giving, userId: user.id },
			}));
		}
		return { data: result };
	}

	static async getList(user, { limit, offset }, filters = {}) {
		const options = {
			where: {
				endDate: {
					[Op.gt]: new Date(),
				},
				...filters,
			},
			offset,
			limit,
		};
		if (user) {
			options.include = {
				model: UserInterestModel,
				as: 'interests',
				where: {
					userId: user.id,
				},
				required: false,
			};
		}
		let { count: totalRecords, rows: data } = await GivingModel.findAndCountAll(options);
		if (user) {
			data = data.map((row) => {
				row = row.toJSON();
				row.isInterested = row.interests && row.interests.length;
				delete row.interests;
				return row;
			});
		}
		return { totalRecords, data };
	}
}

module.exports = Giving;
