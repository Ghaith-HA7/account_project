const moment = require('moment-hijri');
module.exports = {
	names: {
		NewYearsEve: 'New Years Eve',
		ChristmasEve: 'Christmas Eve',
		mothersDay: "mother's Day",
		IslamicNewYear: 'Islamic New Year',
		ramadan: 'Ramadan',
		eidUlFitr: 'Eid-Ul-Fitr',
		eidUlAdha: 'Eid-Ul-Adha',
		mawlidUlNabiUlSharif: 'Ul-Mawlid-Ul-Nabawi-Ul-Sharif',
	},
	dates: {
		NewYearsEve: '01-01',
		ChristmasEve: '12-24',
		mothersDay: '03-21',
	},
	hijriDates: {
		IslamicNewYear: '01-01',
		ramadan: '09-01',
		eidUlFitr: '10-01',
		eidUlAdha: '12-10',
		mawlidUlNabiUlSharif: '03-12',
	},
	isOccasion: function () {
		let occasion;
		let hijriOccasion;
		let currentYear = moment().year();
		let currentHijriMonth = moment().iMonth() + 1;
		let currentHijriDay = moment().iDate();
		/** find if any occasion exist at this day */
		for (const [occasionName, occasionDate] of Object.entries(this.dates)) {
			occasion = moment().isSame(`${currentYear}-${occasionDate}`) ? this.names[occasionName] : undefined;
			if (occasion) break;
		}
		for (const [hijriOccasionName, hijriOccasionDate] of Object.entries(this.hijriDates)) {
			switch (hijriOccasionName) {
				case 'ramadan':
					hijriOccasion = currentHijriMonth === 9 ? this.names[hijriOccasionName] : undefined;
					break;
				case 'eidUlFitr':
					hijriOccasion =
						currentHijriMonth === 10 && currentHijriDay < 4 ? this.names[hijriOccasionName] : undefined;
				case 'eidUlAdha':
					hijriOccasion =
						currentHijriMonth === 12 && currentHijriDay < 14 && currentHijriDay > 9
							? this.names[hijriOccasionName]
							: undefined;
				case 'IslamicNewYear':
					hijriOccasion =
						currentHijriMonth === 1 && currentHijriDay === 1 ? this.names[hijriOccasionName] : undefined;
				case 'mawlidUlNabiUlSharif':
					hijriOccasion =
						currentHijriMonth === 3 && currentHijriDay === 12 ? this.names[hijriOccasionName] : undefined;
				default:
					break;
			}
			if (hijriOccasion) break;
		}
		return { occasion, hijriOccasion };
	},
};
