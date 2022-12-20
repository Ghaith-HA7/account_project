const UserMasjidEventModel = require('../models/userMasjidEvent');
const MasjidEventModel = require('../models/masjidEvent');
const {
	Exception,
	statusCodes,
	database: { sequelize },
} = require('usol-utils');
const { Op } = require('sequelize');
const moment = require('moment');
const _ = require('lodash');
const PaymentService = require('../../../../payment/services/payment');
const Payment = require('../../../../payment/models/payment');

const cmp = (d1, d2) => d1.toDateString() === d2.toDateString();
class UserMasjidEvent {
	constructor(data) {
		this.dates =
			(data.dates &&
				_.uniqWith(
					data.dates.map((date) => new Date(date.toDateString())),
					cmp
				)) ||
			[];
		this.numberOfFamilyMembers = data.numberOfFamilyMembers;
		this.paymentMethodId = data.paymentMethodId;
		this.supportAmount = data.supportAmount || 0;
	}

	async registerUser(userId, eventId) {
		const result = await sequelize.transaction(async (trx) => {
			const event = await MasjidEventModel.findByPk(eventId);
			if (!event) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'event not found!');
			if (event.endDate < new Date()) throw new Exception(statusCodes.BAD_REQUEST, 'event has ended');
			let count;
			if (!event.dailyRenew) {
				const where = { masjidEventId: eventId };
				const booking = await UserMasjidEventModel.findOne({ where: { ...where, userId } });
				if (booking) throw new Exception(statusCodes.BAD_REQUEST, 'you have registered before');
				count = !event.fee
					? await UserMasjidEventModel.count({ where })
					: await Payment.count({
							where: { targetId: eventId, targetType: Payment.targetTypes.MasjidEvent, confirmed: true },
					  });
				if (count + 1 > event.total && event.total !== -1) {
					throw new Exception(statusCodes.BAD_REQUEST, 'event is full');
				}
				const result = await UserMasjidEventModel.create({
					numberOfFamilyMembers: this.numberOfFamilyMembers,
					userId,
					masjidEventId: eventId,
				});
				let client_secret;
				if (event.fee) {
					if (!this.paymentMethodId)
						throw new Exception(statusCodes.BAD_REQUEST, 'paymentMethodId is missing');
					const payData = await PaymentService.splitTransfer(userId, Payment.targetTypes.MasjidEvent, {
						targetId: eventId,
						targetAmount: event.fee,
						supportAmount: this.supportAmount,
						paymentMethodId: this.paymentMethodId,
					});
					client_secret = payData.data.client_secret;
				}
				return { bookings: [result.toJSON()], client_secret };
			} else {
				const result = await Promise.all(
					this.dates.map(async (date) => {
						const startOfDayDate = new moment(date);
						const endOfDayDate = startOfDayDate.clone().add(23, 'hour').add(59, 'minute').utc();
						if (!(event.startDate <= date && event.endDate >= date))
							throw new Exception(
								statusCodes.BAD_REQUEST,
								`event is not available for selected date ${date.toDateString()}`
							);
						const where = {
							masjidEventId: eventId,
							date: {
								[Op.between]: [startOfDayDate, endOfDayDate],
							},
						};
						const booking = await UserMasjidEventModel.findOne({ where: { ...where, userId } });
						if (booking)
							throw new Exception(
								statusCodes.BAD_REQUEST,
								`you have registered before in this date: ${date.toDateString()}`
							);
						count = await UserMasjidEventModel.count({ where });
						if (count + 1 > event.total && event.total !== -1) {
							throw new Exception(statusCodes.BAD_REQUEST, `event is full at ${date.toDateString()}`);
						}
						return await UserMasjidEventModel.create({
							numberOfFamilyMembers: this.numberOfFamilyMembers,
							userId,
							masjidEventId: eventId,
							date,
						});
					})
				);
				let client_secret;
				if (event.fee) {
					if (!this.paymentMethodId)
						throw new Exception(statusCodes.BAD_REQUEST, 'paymentMethodId is missing');
					const payData = await PaymentService.splitTransfer(userId, Payment.targetTypes.MasjidEvent, {
						targetId: eventId,
						targetAmount: event.fee,
						supportAmount: this.supportAmount,
						paymentMethodId: this.paymentMethodId,
					});
					client_secret = payData.data.client_secret;
				}
				return { bookings: result, client_secret };
			}
		});
		return result;
	}

	static async unregisterUser(userId, eventId) {
		await sequelize.transaction(async (trx) => {
			await UserMasjidEventModel.destroy({ where: { userId, masjidEventId: eventId } });
			await Payment.destroy({
				where: {
					targetId: eventId,
					targetType: Payment.targetTypes.MasjidEvent,
					userId,
					confirmed: false,
				},
			});
		});
	}
}

module.exports = UserMasjidEvent;
