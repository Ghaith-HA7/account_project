const jwt = require('jsonwebtoken');
const config = require('config');
const UserService = require('../../user/services/user');
const {
	statusCodes,
	Exception,
	database: { sequelize },
} = require('usol-utils');
const { SMS, codeGenerator } = require('../../../utils');
const _ = require('lodash');
const { AUTH_SECRET_KEY } = config.has('jwt') ? config.get('jwt') : {};

class AuthService {
	static syriaVerificationCode = 111111;
	static async signUp(data) {
		const filteredData = _.pick(data, [
			'firstName',
			'lastName',
			'email',
			'prayerTimeMethod',
			'madhab',
			'occupation',
			'city',
			'country',
			'website',
			'mobileNumber',
			'lng',
			'lat',
			'location',
		]);

		filteredData.verificationCode = codeGenerator();
		return sequelize.transaction(async (trx) => {
			const user = await new UserService(filteredData).createUser();
			await SMS.sendActivationCode(user.verificationCode, user.mobileNumber);
			return { msg: 'verification code has been sent.' };
		});
	}

	static async verifyCode(code, mobileNumber) {
		const user = await UserService.findByNumber(mobileNumber);
		// check for the special code
		// todo: remove this code when sms problem got fixed
		if (code !== user.verificationCode && code !== this.syriaVerificationCode)
			throw new Exception(statusCodes.BAD_REQUEST, 'Incorrect code');
		await user.update({ verificationCode: null });
		const accessToken = await AuthService.generateAccessToken(user);
		return {
			data: {
				...user.toJSON(),
				accessToken,
			},
		};
	}

	static async generateAccessToken(user) {
		return await jwt.sign(
			{
				id: user.id,
				email: user.email,
				role: user.role,
			},
			AUTH_SECRET_KEY
		);
	}

	/**
	 * verify the access token sent by client and get user data
	 * @param {string} authorization
	 * @param {boolean} throwError
	 * @returns {User|undefined}
	 */
	static verifyJwtTokenAndGetUser(authorization, throwError) {
		if (!authorization) {
			if (throwError) throw new Exception(statusCodes.UNAUTHORIZED, 'Please log in');
			else return undefined;
		}
		const token = authorization.split(' ')[1];
		return new Promise((resolve, reject) => {
			jwt.verify(token, AUTH_SECRET_KEY, (err, decoded) => {
				if (err) {
					if (throwError) reject(new Exception(statusCodes.UNAUTHORIZED, 'Invalid access token'));
					else resolve();
				} else resolve(_.omit(decoded, ['iat', 'exp']));
			});
		});
	}

	static async restrictTo(userRole, roles) {
		if (!userRole) throw new Exception(statusCodes.UNAUTHORIZED, 'Please log in ');
		if (!roles.includes(userRole))
			throw new Exception(statusCodes.FORBIDDEN, "You don't have permission to perform this action");
	}

	static async login(mobileNumber) {
		const user = await UserService.findByNumber(mobileNumber);
		const verificationCode = codeGenerator();
		return sequelize.transaction(async (trx) => {
			await user.update({ verificationCode });
			await SMS.sendActivationCode(verificationCode, mobileNumber);
			return { msg: 'verification code has been sent.' };
		});
	}
}

module.exports = AuthService;
