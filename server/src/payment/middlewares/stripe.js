const { Exception, statusCodes } = require('usol-utils');
const config = require('config');
/** stripe live secret key */
const stripeLive = require('stripe')(config.get('stripe.secretKey'));
const endpointSecret = config.get('stripe.endpointSecret');
/** stripe test secret key */
const stripeTest = require('stripe')(config.get('stripe.secretKeyTest'));
const endpointSecretTest = config.get('stripe.endpointSecretTest');

class Stripe {
	constructor() {}

	/** create express account  */
	static async createExpressAccount(isTest) {
		const stripe = isTest ? stripeTest : stripeLive;
		let account;
		try {
			account = await stripe.accounts.create({
				type: 'express',
				capabilities: {
					card_payments: {
						requested: true,
					},
					transfers: {
						requested: true,
					},
				},
			});
		} catch (error) {
			throw new Exception(statusCodes.BAD_REQUEST, error.message);
		}
		return account;
	}

	/** Link stripe account */
	static async linkAccount(accountId, refreshUrl, returnUrl, isTest) {
		const stripe = isTest ? stripeTest : stripeLive;
		let accountLink;
		try {
			accountLink = await stripe.accountLinks.create({
				account: accountId,
				refresh_url: refreshUrl,
				return_url: returnUrl,
				type: 'account_onboarding',
			});
		} catch (error) {
			throw new Exception(statusCodes.BAD_REQUEST, error.message);
		}

		return accountLink;
	}

	/** unlink stripe account */
	static async unlinkAccount(accountId, isTest) {
		const stripe = isTest ? stripeTest : stripeLive;
		let accountUnlink;
		try {
			accountUnlink = await stripe.accounts.del(accountId);
		} catch (error) {
			throw new Exception(statusCodes.BAD_REQUEST, error.message);
		}
		return accountUnlink;
	}

	/** create new customer */
	static async createCustomer(email, isTest) {
		const stripe = isTest ? stripeTest : stripeLive;
		let customer;
		try {
			customer = await stripe.customers.create({
				email,
			});
		} catch (error) {
			throw new Exception(statusCodes.BAD_REQUEST, error.message);
		}
		return customer;
	}

	/** create split transfer */
	static async createSplitTransfer(
		amount,
		application_fee_amount,
		destination,
		paymentMethodId,
		description,
		customerId,
		isTest
	) {
		let payment;
		const stripe = isTest ? stripeTest : stripeLive;
		try {
			if (!destination) {
				payment = await stripe.paymentIntents.create({
					amount,
					currency: 'cad',
					payment_method: paymentMethodId,
					payment_method_types: ['card'],
					customer: customerId,
					description,
				});
			} else {
				payment = await stripe.paymentIntents.create({
					amount,
					currency: 'cad',
					payment_method: paymentMethodId,
					payment_method_types: ['card'],
					customer: customerId,
					description,
					transfer_data: {
						destination: destination.value,
						amount: amount - application_fee_amount,
					},
				});
			}
		} catch (err) {
			throw new Exception(statusCodes.BAD_REQUEST, err.message);
		}
		return payment;
	}

	static async verifyWebhookSignature(eventData, isTest) {
		const stripe = isTest ? stripeTest : stripeLive;
		const secret = isTest ? endpointSecretTest : endpointSecret;
		const payloadString = JSON.stringify(eventData);
		let header;
		try {
			header = await stripe.webhooks.generateTestHeaderString({
				payload: payloadString,
				secret,
			});
			await stripe.webhooks.constructEvent(payloadString, header, secret);
		} catch (err) {
			console.log('Webhook signature verification failed.', err.message);
			throw new Exception(statusCodes.BAD_REQUEST, 'Webhook signature verification failed.');
		}
	}

	static async getAccountId(accountId) {
		const account = await stripeLive.accounts.retrieve(accountId);
		return account;
	}
}

module.exports = Stripe;
