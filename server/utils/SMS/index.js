const config = require('config');
const AWS = require('aws-sdk');
const SMSTemplates = require('./SMS-templates');

const AWS_CONFIGS = config.has('AWS') ? config.get('AWS') : {};
if (!config.has('AWS')) console.warn('Missing AWS configs');
const { ACCESS_KEY_ID, SECRET_KEY, REGION } = AWS_CONFIGS;

AWS.config.update({
	region: REGION,
	accessKeyId: ACCESS_KEY_ID,
	secretAccessKey: SECRET_KEY,
	attributes: {
		DefaultSMSType: 'Transactional',
	},
});

const sendSMS = async (Message, PhoneNumber) => {
	console.log(`Sending verification code to ${PhoneNumber}`);
	return new AWS.SNS({ apiVersion: '2010-03-31' })
		.publish({
			Message,
			PhoneNumber,
			MessageAttributes: {
				'AWS.SNS.SMS.SenderID': {
					DataType: 'String',
					StringValue: 'Muslim',
				},
			},
		})
		.promise();
};
const sendActivationCode = async (code, PhoneNumber) => sendSMS(SMSTemplates.activationCode(code), PhoneNumber);

module.exports = {
	sendSMS,
	sendActivationCode,
};
