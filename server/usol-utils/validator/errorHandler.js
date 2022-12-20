//Request Validator
const { validationResult } = require('express-validator');
const statusCodes = require('../statusCodes');

/******************
 * @ErrorHandler *
 *****************/

/**
 * Validator Error Handler
 *
 * @param {Request} req Http Request
 * @param {Response} res Http Response
 * @param {*} next Next Function
 */

const errorHandler = (req, res, next) => {
	const errors = validationResult(req);
	errors.isEmpty()
		? next()
		: res.status(statusCodes.VALIDATION_ERROR).json({ msg: 'Input Error.', errors: errors.array() });
};

/************
 * @Exports *
 ************/

//Validator Error Handler
module.exports = errorHandler;
