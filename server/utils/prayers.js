const adhan = require('adhan');
module.exports = {
	names: ['Fajr', 'Zuhr', 'Asr', 'Maghreb', 'Ishaa'],
	order: {
		Fajr: 1,
		Zuhr: 2,
		Asr: 3,
		Maghreb: 4,
		Ishaa: 5,
	},
	allowedTimeAfterPrayer: 30,
	AdhanNames: {
		Fajr: 'fajr',
		Zuhr: 'dhuhr',
		Asr: 'asr',
		Maghreb: 'meghrib',
		Ishaa: 'ishaa',
	},
	calculateAdhan: function (masjid, prayer, date) {
		const params = adhan.CalculationMethod[masjid.method]();
		params.madhab = adhan.Madhab[masjid.madhab];
		const coordinates = new adhan.Coordinates(masjid.lat, masjid.lng);
		const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);
		return prayerTimes[this.AdhanNames[prayer.prayerName]];
	},
};
