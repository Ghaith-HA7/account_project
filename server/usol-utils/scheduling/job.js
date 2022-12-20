const { CronTime } = require('cron');
const path = require('path');
const { execSync, exec } = require('child_process');
class Job {
	/**
	 * @param {String} dirname Pass __dirname here
	 * @returns {Job}
	 */
	constructor(dirname, customCronString = undefined) {
		if (!dirname) throw new Error('Must pass __dirname in the constructor');
		this.dirname = dirname;
	}

	getEntryPoint() {
		return path.join(this.dirname, 'index.js');
	}

	/**
	 * @param {Object} options
	 * @param {Boolean} [options.startNow]
	 * @param {String} [options.cronStr] 0 0 * * *
	 */
	start(options = {}) {
		this.stop();
		let command = `FORCE_COLOR=1 pm2 start "${this.getEntryPoint()}" -f --name ${
			this.constructor.name
		} -- --startNow=${options.startNow == true ? 'true' : 'false'} `;
		if (options.cronStr) {
			command += `--cronStr="${cronStr}"`;
		}
		execSync(command, {
			env: {
				HOME: process.env.HOME,
				PATH: process.env.PATH,
			},
		});
	}

	/**
	 *
	 * @param {object} options
	 * @param {Boolean} [options.execAsync]
	 */
	stop(options = { execAsync: false }) {
		try {
			let func = options.execAsync ? exec : execSync;
			let args = [`pm2 delete ${this.constructor.name}`];
			options.execAsync || args.push({ env: { HOME: process.env.HOME, PATH: process.env.PATH } });
			func(...args);
		} catch (err) {
			console.error(err);
		}
	}
}

module.exports = Job;
