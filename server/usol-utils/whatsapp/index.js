const config = require('config');
const api = require('axios');
const baseUrl = 'https://api.chat-api.com/instance109741/';

let whatsapp;
if (config.has('whatsapp')) whatsapp = config.get('whatsapp');
else console.warn('Missing whatsapp configs');

/**
 * Sends a Whatsapp message.
 * @param phone {string} starts with country code number without '+' or '00' in the beginning,
 * @param message {string}
 * @returns Promise <{sent: boolean, message: string}>
 */
async function send(phone, message) {
	if (whatsapp) {
		const { token } = whatsapp;
		if (!token) {
			console.error('Failed to send whatsapp message, token config is missing.');
			return { sent: false, message: 'token config is missing.' };
		}
		if (!phone || !phone.length) {
			console.error(`Failed to send Whatsapp message: \"${message}\", recipient phone number is missing`);
			return { sent: false, message: 'recipient phone number is missing' };
		}

		const phoneNumber = phone.startsWith('+') ? phone.substring(1) : phone;
		console.info(`Sending Whatsapp message: \"${message}\" to ${phone}`);
		let res;
		try {
			res = await api.post(
				baseUrl + 'sendMessage',
				{
					phone: phoneNumber,
					body: message,
				},
				{
					params: { token },
				}
			);
		} catch (e) {
			console.error(e);
			return { sent: false, message: e.message };
		}
		if (res) {
			if (res.data.sent) console.info(`Whatsapp message: \"${message}\" was sent to ${phone}`);
			else console.error(`Failed to send Whatsapp message: \"${message}\" to ${phone}, ${res.data.message}`);
			return res.data;
		} else return { sent: false, message: 'No response' };
	} else {
		console.error('Failed to send whatsapp message, whatsapp config is missing.');
		return { sent: false, message: 'whatsapp config is missing.' };
	}
}

module.exports = {
	send,
};
