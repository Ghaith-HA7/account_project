const Booking = require('../services/booking');
const { statusCodes } = require('usol-utils');

module.exports = {
	getBookingList: async (req, res) => {
		const userId = req.user.id;
		const query = req.query;
		const data = await Booking.getBookingList(userId, query);
		res.status(statusCodes.OK).json({ msg: 'OK', ...data });
	},

	getBookingStatus: async (req, res) => {
		const query = req.query;
		const data = await Booking.getBookingStatus(query);
		res.status(statusCodes.OK).json({ msg: 'OK', data });
	},

	authorize: async (req, res) => {
		const body = req.body;
		const data = await Booking.authorize(body);
		res.status(statusCodes.UPDATED).json({ msg: 'UPDATED', data });
	},

	restrict: (type) => async (req, res, next) => {
		const eventId = req[type].eventId;
		const user = req.user;
		await Booking.restrict(eventId, user);
		next();
	},
};
