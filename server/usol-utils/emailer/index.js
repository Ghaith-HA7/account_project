const config = require('config');
const nodemailerApi = require('nodemailer');
const mandrillApi = require('mandrill-api/mandrill');

let emailer;
if (config.has('emailer')) emailer = config.get('emailer');
else console.warn('Missing emailer configs');

/**
 * If username was not specified, the default account will send the email if exists
 * if the provided username does not match any account in configs, the email will not be sent.
 * This function supports attachments as an optional array of objects in email.
 * @param {String[]} destinations
 * @param {Object}email
 * @param {String}email.subject
 * @param {String}email.text
 * @param {String}[email.html]
 * @param {Array<{[filename]: String, [content]: String,
 * [path]: String, [contentType]: String,
 * [encoding]: String, [raw]: String}>} [email.attachments]
 * @param {String}[username]
 */
async function send(destinations, email, username) {
	if (emailer) {
		const { defaultAccount, accounts } = emailer;
		let account;
		if (username) {
			if (accounts) {
				let user = accounts.find((acc) => acc.username === username);
				if (user) account = user;
				else {
					console.error('Failed to send email, no such user in config');
					return { message: 'Failed to send email, no such user in config' };
				}
			} else {
				console.error('Failed to send email, no accounts in config');
				return { message: 'Failed to send email, no accounts in config' };
			}
		} else {
			if (!defaultAccount) {
				console.error('Failed to send email, missing default emailing account configs');
				return { message: 'Failed to send email, missing default emailing account configs' };
			} else account = defaultAccount;
		}

		if (account.type === 'nodemailer') {
			if (!account.host || !account.port || !account.username || !account.password || !account.name) {
				console.error('Failed to send email, invalid nodemailer account configs');
				return { message: 'Failed to send email, invalid nodemailer account configs' };
			} else return nodemailer.send(destinations, email, account);
		} else if (account.type === 'mandrill') {
			if (!account.username || !account.apiKey || !account.name) {
				console.error('Failed to send email, invalid mandrill account configs');
				return { message: 'Failed to send email, invalid mandrill account configs' };
			} else return mandrill.send(destinations, email, account);
		} else {
			console.error('Failed to send email, missing account type configs');
			return { message: 'Failed to send email, missing account type configs' };
		}
	} else {
		console.error('Failed to send email, missing emailer configs');
		return { message: 'Failed to send email, missing emailer configs' };
	}
}

const nodemailer = {
	/**
	 *
	 * @param {String[]} destinations
	 * @param {Object}email
	 * @param {String}email.subject
	 * @param {String}email.text
	 * @param {String}[email.html]
	 * @param {Array<{[filename]: String, [content]: String,
	 * [path]: String, [contentType]: String,
	 * [encoding]: String, [raw]: String}>} [email.attachments]
	 * @param {{host:Number,port: Number,username:String , password: String}} account
	 */
	send: async function (destinations, email, account) {
		const transporter = nodemailerApi.createTransport({
			pool: true,
			host: account.host,
			port: account.port,
			secure: false, // true for 465, false for other ports
			auth: {
				user: account.username,
				pass: account.password,
			},
			tls: {
				rejectUnauthorized: false,
			},
		});
		return new Promise((resolve, reject) => {
			transporter.sendMail(
				{
					subject: email.subject,
					text: email.text,
					html: email.html,
					attachments: email.attachments,
					envelope: {
						from: `"${account.name}" <${account.username}>`,
						bcc: destinations.join(','),
					},
				},
				(err, res) => {
					if (err) {
						console.error(err);
						resolve({ message: 'Failed to send email, ' + err.message });
					}
					if (res) {
						resolve(res);
					}
				}
			);
		});
	},
};

const mandrill = {
	/**
	 *
	 * @param {String[]} destinations
	 * @param {Object}email
	 * @param {String}email.subject
	 * @param {String}email.text
	 * @param {String}[email.html]
	 * @param {Array<{[filename]: String, [content]: String,
	 * [path]: String, [contentType]: String,
	 * [encoding]: String, [raw]: String}>} [email.attachments]
	 * @param {{username:String , apiKey: String}} account
	 */
	send: async function (destinations, email, account) {
		const mandrillClient = new mandrillApi.Mandrill(account.apiKey);
		const message = {
			subject: email.subject,
			text: email.text,
			html: email.html,
			from_email: account.username,
			from_name: account.name,
			to: destinations.map((email) => {
				return {
					email,
				};
			}),
			attachments: email.attachments,
		};
		return new Promise((resolve, reject) => {
			mandrillClient.messages.send(
				{ message },
				function (result) {
					resolve(result);
				},
				function (error) {
					console.error(error);
					resolve({ message: error.message });
				}
			);
		});
	},
};

module.exports = {
	send,
};
