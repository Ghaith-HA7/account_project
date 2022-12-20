const axios = require('axios');
const config = require('config');
const moment = require('moment');

let sms;
if (config.has('sms')) sms = config.get('sms');
else console.warn('Missing SMS configs');

const action = 'sendsms';

/**
 * Send sms text message to one or more phone numbers
 * This function supports optional scheduling messages
 * @param phones {string[]}
 * @param text {string}
 * @param {string | Date} [scheduleDateTime]
 * @returns {Promise<[{phone: string, message: string}]> | Promise<{message: string}> }
 */
const send = async function (phones, text, scheduleDateTime) {
	if (sms) {
		const { gateway, user, password, from } = sms;
		if (!gateway || !user || !password || !from) {
			console.error('Failed to send SMS message, missing configs.');
			return { message: 'Failed to send SMS message, missing configs.' };
		}
		if (!phones || !phones.length) {
			console.error('Failed to send SMS message, recipients phone numbers are missing');
			return { message: 'Failed to send SMS message, recipients phones numbers are missing' };
		}

		return await Promise.all(
			phones.map(async (phone) => {
				if (!phone.length) {
					console.error('Failed to send SMS message, recipient phone number is empty');
					return Promise.resolve({
						phone,
						message: 'Failed to send SMS message, recipient phone number is empty',
					});
				}

				console.info(`Sending SMS message: \"${text}\" to ${phone}`);
				const phoneNumber = phone.startsWith('+') ? phone.substring(1) : phone;
				let smsLink = ` https://${gateway}/http-api.php`;
				let params = {
					action,
					user,
					password,
					from,
					to: phoneNumber,
					text,
				};
				if (scheduleDateTime)
					params.scheduledatetime = moment(scheduleDateTime)
						.tz('Australia/Sydney')
						.format('YYYY-MM-DD HH:mm:ss');
				let res;
				try {
					res = await axios.get(smsLink, {
						params,
					});
				} catch (e) {
					console.error(e);
					return Promise.resolve({ phone, message: e.message });
				}
				return { phone, message: res.data };
			})
		);
	} else {
		console.error('Failed to send SMS message, missing configs.');
		return { message: 'Failed to send SMS message, missing configs.' };
	}
};

module.exports = {
	send,
};
