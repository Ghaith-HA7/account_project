const PaymentModel = require('../models/payment');
const PaymentSettingModel = require('../models/paymentSetting');
const UserModel = require('../../user/models/user');
const UserSettingModel = require('../../user/models/userSetting');
const Stripe = require('../middlewares/stripe');
const {
	Exception,
	statusCodes,
	database: { sequelize },
} = require('usol-utils');
const { Op } = require('sequelize');
const moment = require('moment');
const _ = require('lodash');

class Payment {
	constructor() {}
	static AccountKeys = {
		zakatUlMal: 'zakatUlMalStripeAccountId',
		zakatUlFtr: 'zakatUlFtrStripeAccountId',
		givings: 'givingsStripeAccountId',
		meals: 'mealsStripeAccountId',
		masjids: 'masjidStripeAccountId',
		masjidEvents: 'masjidEventStripeAccountId',
	};
	static TestAccountKeys = {
		zakatUlMal: 'testZakatUlMalStripeAccountId',
		zakatUlFtr: 'testZakatUlFtrStripeAccountId',
		givings: 'testGivingsStripeAccountId',
		meals: 'testMealsStripeAccountId',
		masjids: 'testMasjidStripeAccountId',
		masjidEvents: 'testMasjidEventStripeAccountId',
	};
	static AppFeeKeys = {
		zakatUlMal: 'zakatUlMalAppFee',
		zakatUlFtr: 'zakatUlFtrAppFee',
		givings: 'givingsAppFee',
		meals: 'mealsAppFee',
		masjids: 'masjidAppFee',
		masjidEvents: 'masjidEventAppFee',
	};

	/**
	 * @summary: set stripe mode account to live or test ( live by default )
	 */
	static async setStripeMode(mode) {
		let result = await PaymentSettingModel.upsert({
			key: 'stripeMode',
			value: mode,
		});
		return { data: result };
	}
	static async getStripeMode() {
		let mode = await PaymentSettingModel.findByPk('stripeMode');
		if (!mode) mode = { value: 'live' };
		return { data: { value: mode.value } };
	}
	/**
	 * @param user: the user who is linking account
	 * @param targetUserId: if super admin is linking a user account he should specify which userId
	 * @param mode: if the mode is either test or live mode (the mode is live by default)
	 * @param type: account type ( giving, masjid, masjidEvents, meals, zakatUlMal, zakatUlFtr )
	 * @param refreshUrl: in case stripe link expired the user will be linked to the refresh_link
	 * @param returnUrl: in case user complete or didn't complete filling information the user will be linked to the return_url
	 */
	static async linkAccount(user, targetUserId, { type, refreshUrl, returnUrl }) {
		if (user.role !== 'superAdmin')
			throw new Exception(statusCodes.FORBIDDEN, "You don't have permission to perform this action");

		// if (user.role === 'superAdmin') {
		// 	if (!targetUserId) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'could not find target user id');
		// 	userId = targetUserId;
		// }
		let userId = user.id;
		let accountLink;
		/** in case the type required target Id (giving, masjid, masjidEvents)*/
		let targetIdCondition = _.includes(
			[PaymentModel.targetTypes.Giving, PaymentModel.targetTypes.Masjid, PaymentModel.targetTypes.MasjidEvent],
			type
		);
		const data = await sequelize.transaction(async (trx) => {
			let mode = await this.getStripeMode();
			let isTest = mode.data.value === 'test' ? true : false;
			const userSetting = await UserSettingModel.findOne({
				where: {
					userId,
					key: isTest ? this.TestAccountKeys[type] : this.AccountKeys[type],
				},
			});
			if (!targetIdCondition && userSetting)
				throw new Exception(statusCodes.DUPLICATED_ENTRY, `${type} account already linked`);
			else {
				let account = await Stripe.createExpressAccount(isTest);
				await UserSettingModel.create({
					userId,
					key: isTest ? this.TestAccountKeys[type] : this.AccountKeys[type],
					value: account.id,
				});
				accountLink = await Stripe.linkAccount(account.id, refreshUrl, returnUrl, isTest);
				return accountLink;
			}
		});

		return { data };
	}

	static async setDefaultAppFee({ type, percentage }) {
		let paymentSetting = await PaymentSettingModel.upsert({
			key: this.AppFeeKeys[type],
			value: percentage,
		});
		return { data: paymentSetting };
	}

	static async setAppFee(targetId, { type, percentage }) {
		const data = await sequelize.transaction(async (trx) => {
			let target;
			switch (type) {
				case PaymentModel.targetTypes.Giving:
					target = await sequelize.model('Giving').findByPk(targetId);
					break;
				case PaymentModel.targetTypes.Masjid:
					target = await sequelize.model('Masjid').findByPk(targetId);
					break;
				case PaymentModel.targetTypes.MasjidEvent:
					target = await sequelize.model('MasjidEvent').findByPk(targetId);
					break;
				default:
					target = undefined;
			}
			if (!target) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			let userId = target.ownerId ? target.ownerId : target.adminId;

			let appFeeSetting = await UserSettingModel.upsert({
				key: this.AppFeeKeys[type],
				userId,
				value: percentage,
				confirmed: true,
			});
			return appFeeSetting;
		});

		return { data };
	}

	/**
	 * @summary split transfer api to automatically split the amount when payment is made to the stripe account
	 * @param userId: person who paid
	 * @param type: the type of zakat
	 * @param data.targetId: only for the id of giving or masjid or event
	 * @param data.targetAmount: the amount which the organization will recive
	 * @param data.supportAmount: the amount which the muslimApp will receive
	 * @param data.date: the meal date which the user determine a meal in a specific date
	 * @param data.paymentMethodId
	 */
	static async splitTransfer(userId, type, paymentData) {
		/** stripe consider the amount value in cents, each 100 cent = 1$ */
		let targetAmount = paymentData.targetAmount;
		let paymentMethodId = paymentData.paymentMethodId;

		/** in case the type required target Id (giving, masjid, masjidEvents)*/
		let targetIdCondition = _.includes(
			[PaymentModel.targetTypes.Giving, PaymentModel.targetTypes.Masjid, PaymentModel.targetTypes.MasjidEvent],
			type
		);
		let appFeeAmount,
			accountAmount,
			muslimAmount,
			targetId,
			customerId,
			description,
			supportAmount = 0;
		let date;

		if (targetIdCondition) targetId = paymentData.targetId;
		if (paymentData.supportAmount) supportAmount = paymentData.supportAmount;
		const data = await sequelize.transaction(async (trx) => {
			let mode = await this.getStripeMode();
			let isTest = mode.data.value === 'test' ? true : false;

			let accountId = await UserSettingModel.findOne({
				where: {
					key: isTest ? this.TestAccountKeys[type] : this.AccountKeys[type],
					confirmed: true,
				},
				attributes: ['value'],
			});
			let appFee = await UserSettingModel.findOne({
				where: { key: this.AppFeeKeys[type] },
				attributes: ['value'],
			});

			/** make sure that stripe customer id existed and manage stripe in test and live mode */
			let user = await UserModel.findByPk(userId);
			if (!user.stripeCustomerId && !isTest) {
				let customer = await Stripe.createCustomer(user.email, isTest);
				customerId = customer.id;
				await user.update({ stripeCustomerId: customer.id });
			} else if (!user.stripeTestCustomerId && isTest) {
				let customer = await Stripe.createCustomer(user.email, isTest);
				customerId = customer.id;
				await user.update({ stripeTestCustomerId: customer.id });
			} else {
				customerId = isTest ? user.stripeTestCustomerId : user.stripeCustomerId;
			}

			if (!appFee) appFeeAmount = 0;
			else appFeeAmount = (targetAmount * appFee.value) / 100;
			accountAmount = targetAmount + supportAmount;
			muslimAmount = appFeeAmount + supportAmount;
			description = targetId
				? `targetId: ${targetId} & type: ${type} & support amount: $${supportAmount / 100}`
				: `type: ${type} &  support amount: $${supportAmount / 100}`;
			const payment = await Stripe.createSplitTransfer(
				accountAmount,
				muslimAmount,
				accountId,
				paymentMethodId,
				description,
				customerId,
				isTest
			);
			if (targetIdCondition) {
				await PaymentModel.create({
					paymentStripeId: payment.id,
					userId,
					targetId,
					targetType: type,
					targetAmount: accountAmount - muslimAmount /** amount stored in cents */,
					muslimAmount,
				});
			} else if (type === PaymentModel.targetTypes.Meals) {
				date = paymentData.date;
				await PaymentModel.create({
					paymentStripeId: payment.id,
					userId,
					targetType: type,
					targetAmount: accountAmount - muslimAmount /** amount stored in cents */,
					muslimAmount,
					date,
				});
			} else {
				await PaymentModel.create({
					paymentStripeId: payment.id,
					userId,
					targetType: type,
					targetAmount: accountAmount - muslimAmount /** amount stored in cents */,
					muslimAmount,
				});
			}
			return payment;
		});

		return { data };
	}

	static async eventWebhook(eventData) {
		let mode = await this.getStripeMode();
		let isTest = mode.data.value === 'test' ? true : false;
		await Stripe.verifyWebhookSignature(eventData, isTest);
		switch (eventData.type) {
			case 'capability.updated':
				const status = eventData.data.object.status;
				const account = eventData.data.object.account;
				if (status === 'active') {
					await UserSettingModel.update(
						{ confirmed: true },
						{
							where: {
								value: account,
							},
						}
					);
				}
				break;
			case 'payment_intent.succeeded':
				const paymentId = eventData.data.object.id;
				const paymentStatus = eventData.data.object.status;
				if (paymentStatus === 'succeeded') {
					await PaymentModel.update(
						{ confirmed: true },
						{
							where: {
								paymentStripeId: paymentId,
							},
						}
					);
				}
				break;
			case 'payment_intent.payment_failed':
				const paymentStripeId = eventData.data.object.id;
				await PaymentModel.destroy({
					where: {
						paymentStripeId,
					},
				});

				break;
			default:
				break;
		}
	}

	static async unlinkAccount(user, targetUserId, { type }) {
		if (user.role !== 'superAdmin')
			throw new Exception(statusCodes.FORBIDDEN, "You don't have permission to perform this action");
		let userId = user.id;
		// if (user.role === 'superAdmin') {
		// 	if (!targetUserId) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'could not find target user id');
		// 	userId = targetUserId;
		// }
		const data = await sequelize.transaction(async (trx) => {
			let mode = await this.getStripeMode();
			let isTest = mode.data.value === 'test' ? true : false;
			const userSetting = await UserSettingModel.findOne({
				where: {
					userId,
					key: isTest ? this.TestAccountKeys[type] : this.AccountKeys[type],
				},
			});
			if (!userSetting)
				throw new Exception(statusCodes.ITEM_NOT_FOUND, 'could not find stripe account id for this user');
			await UserSettingModel.destroy({
				where: {
					userId,
					key: isTest
						? this.TestAccountKeys[type]
						: { [Op.in]: [this.AccountKeys[type], this.AppFeeKeys[type]] },
				},
			});
			const accountUnlink = await Stripe.unlinkAccount(userSetting.value, isTest);
			return accountUnlink;
		});

		return { data };
	}

	/**
	 * @summary get settings for payments
	 * @param paymentData.type: (givings, zakatUlMal, zakatUlFtr, meals, masjid, masjidEvents)
	 * @param paymentData.targetId: when the target has admin or owner we need the target id only for (giving, masjid, masjidEvent)
	 */
	static async getPaymentSetting(paymentData) {
		let type = paymentData.type;
		/** in case the type required target Id (giving, masjid, masjidEvents)*/
		let targetIdCondition = _.includes(
			[PaymentModel.targetTypes.Giving, PaymentModel.targetTypes.Masjid, PaymentModel.targetTypes.MasjidEvent],
			type
		);
		let appFeePercentage = '100';
		let linked = false;
		let userId,
			appFee = null;

		const data = await sequelize.transaction(async (trx) => {
			/** in case we  get an account is linked in test mode */
			let mode = await this.getStripeMode();
			let isTest = mode.data.value === 'test' ? true : false;
			/** for types that require target id (giving, masjidEvent, masjid) */
			if (targetIdCondition) {
				if (!paymentData.targetId)
					throw new Exception(statusCodes.VALIDATION_ERROR, `You should provide targetId `);
				let targetId = paymentData.targetId;
				let target;
				switch (type) {
					case PaymentModel.targetTypes.Giving:
						target = await sequelize.model('Giving').findByPk(targetId);
						break;
					case PaymentModel.targetTypes.Masjid:
						target = await sequelize.model('Masjid').findByPk(targetId);
						break;
					case PaymentModel.targetTypes.MasjidEvent:
						target = await sequelize.model('MasjidEvent').findByPk(targetId);
						break;
					default:
						target = undefined;
				}
				if (target) {
					userId = target.ownerId ? target.ownerId : target.adminId;

					/** first find if app fee is set for user in user setting */
					appFee = await UserSettingModel.findOne({
						where: {
							key: this.AppFeeKeys[type],
							userId,
						},
					});

					const account = await UserSettingModel.findOne({
						where: {
							key: isTest ? this.TestAccountKeys[type] : this.AccountKeys[type],
							userId,
							confirmed: true,
						},
					});
					if (account !== null) linked = true;
				}
			} else {
				const account = await UserSettingModel.findOne({
					where: {
						key: isTest ? this.TestAccountKeys[type] : this.AccountKeys[type],
						confirmed: true,
					},
				});
				if (account !== null) linked = true;
			}
			/** if no user setting existed for app fee we get the one at payment setting */
			if (appFee === null) {
				appFee = await PaymentSettingModel.findOne({
					where: {
						key: this.AppFeeKeys[type],
					},
				});
			}
			if (appFee !== null) appFeePercentage = appFee.value;

			return { appFeePercentage, linked, mode: mode.data.value };
		});

		return { data };
	}
	static async getUserPayments(criteria, { limit, offset }) {
		const { userId, targetType, targetId, confirmed, createdAt } = criteria;
		let startOfDayDate, endOfDayDate;
		if (createdAt) {
			startOfDayDate = moment(createdAt).utc();
			endOfDayDate = startOfDayDate.clone().add(23, 'hour').add(59, 'minute').utc();
		}
		const whereCriteria = _.omitBy(
			{
				userId,
				targetType,
				targetId,
				confirmed: confirmed ? (confirmed === 'true' ? true : false) : undefined,
				createdAt: createdAt
					? {
							[Op.between]: [startOfDayDate, endOfDayDate],
					  }
					: undefined,
			},
			_.isUndefined
		);
		const { count: totalRecords, rows: payments } = await PaymentModel.findAndCountAll({
			where: {
				...whereCriteria,
			},
			offset,
			limit,
		});
		return { totalRecords, payments };
	}

	static async getByCriteria(userId, criteria, { limit, offset }) {
		let startOfDayDate, endOfDayDate;
		const { targetType, targetId, confirmed, createdAt } = criteria;
		if (createdAt) {
			startOfDayDate = moment(createdAt).utc();
			endOfDayDate = startOfDayDate.clone().add(23, 'hour').add(59, 'minute').utc();
		}
		const whereCriteria = _.omitBy(
			{
				targetType,
				targetId,
				confirmed: confirmed ? (confirmed === 'true' ? true : false) : undefined,
				createdAt: createdAt
					? {
							[Op.between]: [startOfDayDate, endOfDayDate],
					  }
					: undefined,
			},
			_.isUndefined
		);
		const { count: totalRecords, rows: payments } = await PaymentModel.findAndCountAll({
			where: { ...whereCriteria, userId },
			offset,
			limit,
		});
		return { totalRecords, payments };
	}
}

module.exports = Payment;
