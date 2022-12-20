const {
	Exception,
	statusCodes,
	database: { sequelize, Sequelize },
} = require('usol-utils');
const moment = require('moment');
const { Op } = require('sequelize');
const UserService = require('../../user/services/user');
const UserMasjidEvent = require('../../Masjid/subModules/Events/models/userMasjidEvent');
const MasjidEvent = require('../../Masjid/subModules/Events/models/masjidEvent');

class Booking {
	static async getBookingList(userId, query) {
		const { limit, offset } = query;
		const userMasjidEventName = sequelize.model('UserMasjidEvent').tableName;
		const masjidEventsName = sequelize.model('MasjidEvent').tableName;
		const masjidName = sequelize.model('Masjid').tableName;
		const checkinsName = sequelize.model('Checkin').tableName;
		const prayersName = sequelize.model('Prayer').tableName;
		let rawQuery =
			`SELECT e.title, m.name, date, false as isCheckin, e.lat, e.lng FROM ${userMasjidEventName} as b\n` +
			`left outer join ${masjidEventsName} as e on e.id = b.masjidEventId\n` +
			`left outer join ${masjidName} as m on m.id = e.masjidId\n` +
			`where b.userId = :userId\n` +
			`UNION ALL\n` +
			`SELECT p.prayerName as title, m.name, b.prayerDate as date, true as isCheckin, m.lat, m.lng FROM ${checkinsName} as b\n` +
			`left outer join ${masjidName} as m on m.id = b.masjidId\n` +
			`left outer join ${prayersName} as p on m.id = b.prayerId\n` +
			`where b.userId = :userId\n` +
			`ORDER BY date desc\n`;

		let pagination = '',
			totalRecords;
		if (limit && offset) {
			pagination = 'LIMIT ' + offset + ' , ' + limit;
			const counters = await sequelize.query(
				'SELECT count(true) as count FROM usermasjidevents as b\n' +
					'left outer join masjidevents as e on e.id = b.masjidEventId\n' +
					'left outer join masjids as m on m.id = e.masjidId\n' +
					'where b.userId = :userId\n' +
					'UNION ALL\n' +
					'SELECT count(true) as count FROM checkins as b\n' +
					'left outer join masjids as m on m.id = b.masjidId\n' +
					'left outer join prayers as p on m.id = b.prayerId\n' +
					'where b.userId = :userId\n',
				{
					replacements: { userId },
					type: sequelize.QueryTypes.SELECT,
				}
			);
			totalRecords = counters[0].count + counters[1].count;
		}
		const result = await sequelize.query(rawQuery + pagination, {
			replacements: { userId },
			type: sequelize.QueryTypes.SELECT,
		});
		if (!totalRecords) totalRecords = result.length;

		return { totalRecords, data: result };
	}

	static async getBookingStatus(data) {
		let { mobileNumber, eventId, startOfDayDate } = data;
		if (!startOfDayDate) startOfDayDate = moment(new Date()).startOf('day').utc();
		else startOfDayDate = moment(startOfDayDate).utc();
		const endOfDayDate = startOfDayDate.clone().add(23, 'hour').add(59, 'minute').utc();
		const { id } = await UserService.findByNumber(mobileNumber);
		const booking = await UserMasjidEvent.findOne({
			where: { userId: id, masjidEventId: eventId, date: { [Op.between]: [startOfDayDate, endOfDayDate] } },
		});
		if (!booking) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'user is not registered for this event');
		return booking;
	}

	static async authorize(data) {
		const booking = await Booking.getBookingStatus(data);
		if (booking.authorized)
			throw new Exception(statusCodes.BAD_REQUEST, 'this check-in has been already authorized');
		await booking.update({ authorized: true });
		return { id: booking.id, authorized: booking.authorized };
	}

	static async restrict(eventId, user) {
		const event = await MasjidEvent.findByPk(eventId);
		if (!event) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such event');
		if (event.ownerId !== user.id && user.role !== 'superAdmin')
			throw new Exception(statusCodes.FORBIDDEN, 'You do not have permission to perform this action');
	}
}

module.exports = Booking;
