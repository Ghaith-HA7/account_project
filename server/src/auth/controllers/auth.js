const { statusCodes, Exception } = require('usol-utils');
const authenticationService = require('../services/auth');

module.exports = {
	signUp: async (req, res) => {
		const data = req.body;
		const result = await authenticationService.signUp(data);
		res.status(statusCodes.CREATED).json(result);
	},
	verify: async (req, res) => {
		const { code, mobileNumber } = req.body;
		const data = await authenticationService.verifyCode(code, mobileNumber);
		res.status(statusCodes.OK).json(data);
	},

	login: async (req, res) => {
		const mobileNumber = req.body.mobileNumber;
		const result = await authenticationService.login(mobileNumber);
		res.status(statusCodes.OK).json(result);
	},

	accessTokenVerifier: (throwError = true) => async (req, res, next) => {
		const authorization = req.get('authorization');
		req.user = await authenticationService.verifyJwtTokenAndGetUser(authorization, throwError);
		next();
	},
	restrictTo: (...roles) => async (req, res, next) => {
		await authenticationService.restrictTo(req.user.role, roles);
		next();
	},
};
