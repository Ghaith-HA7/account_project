const { CronJob, CronTime } = require('cron');

const args = require('args-parser')(process.argv);

/**
 * @type CronTime
 */
let cTime = null;

try {
	if (args.cronString) {
		try {
			cTime = new CronTime(args.cronString);
		} catch {
			throw new Error('cronStr provided in args is invalid! reverting to "0 0 * * *"');
		}
	} else {
		throw new Error('cronStr not provided in args! reverting to "0 0 * * *"');
	}
} catch (err) {
	cTime = new CronTime('0 0 * * *');
}
/**
 *
 * @param {Function} callback
 */
const launch = (callback) => {
	const job = new CronJob({
		cronTime: cTime.sendAt(),
		onTick: callback,
		onComplete: () => console.warn('*******************\nJob finished running\n********************'),
		start: true,
		runOnInit: args.startNow == 'true' || args.startNow == true,
	});
};

module.exports = launch;
