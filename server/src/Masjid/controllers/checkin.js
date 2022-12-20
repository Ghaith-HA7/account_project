const CheckinService = require('../services/checkin');
const { statusCodes } = require('usol-utils');
const { matchedData } = require('express-validator');

module.exports = {
	/** Add a new checkin */
	book: async (req, res) => {
		const userId = req.user.id;
		const masjidId = req.params.id;
		const { prayerId, prayerDate } = matchedData(req);
		const result = await CheckinService.book(masjidId, prayerId, prayerDate, userId);
		res.status(statusCodes.CREATED).json(result);
	},
	checkIn: async (req, res) => {
		const userId = req.user.id;
		const masjidId = req.params.id;
		const { hallId, bookId, prayerCode } = matchedData(req);
		const result = await CheckinService.checkIn(masjidId, hallId, bookId, prayerCode, userId);
		res.status(statusCodes.OK).json(result);
	},
	deleteCheckin: async (req, res) => {
		const masjidId = req.params.id;
		const userId = req.user.id;
		const { checkinId } = req.body;
		await CheckinService.delete(checkinId, userId, masjidId);
		res.sendStatus(statusCodes.DELETED);
	},
	/** delete all checkins and bookings of user */
	deleteMyCheckinsBookings: async (req, res) => {
		const userId = req.user.id;
		await CheckinService.deleteBookingsCheckinsByUserId(userId);
		res.sendStatus(statusCodes.DELETED);
	},
	getHistory: async (req, res) => {
		const userId = req.user.id;
		const query = req.query;
		const result = await CheckinService.getHistory(userId, query);
		res.status(statusCodes.OK).json(result);
	},
	getUpcomingBookings: async (req, res) => {
		const userId = req.user.id;
		const result = await CheckinService.getUpcomingBookings(userId);
		res.status(statusCodes.OK).json(result);
	},
};
