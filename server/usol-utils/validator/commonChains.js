const { param, query } = require('express-validator');
const { parsePhoneNumberWithError, ParseError } = require('libphonenumber-js');
const phone = (chain) =>
	chain
		.custom((value) => {
			try {
				parsePhoneNumberWithError(value);
			} catch (error) {
				return Promise.reject(error.message);
			}
			return Promise.resolve();
		})
		.customSanitizer((value) => {
			try {
				const phoneNumber = parsePhoneNumberWithError(value);
				return phoneNumber.number;
			} catch (error) {
				return '';
			}
		});

const integer = (chain) =>
	chain
		.notEmpty()
		.withMessage('Empty field value.')
		.isInt({ gt: 0 })
		.withMessage('Field value must be an integer with value > 0.')
		.toInt();

const float = (chain) =>
	chain
		.notEmpty()
		.withMessage('Empty field value.')
		.isFloat({ gt: 0 })
		.withMessage('Field value must be an integer with value > 0.')
		.toFloat();

const string = (chain) =>
	chain.notEmpty().withMessage('Empty field value.').isString().withMessage('Field value must be a string.');

const boolean = (chain) =>
	chain
		.notEmpty()
		.withMessage('Empty field value.')
		.isBoolean()
		.withMessage('Field value must be a boolean.')
		.toBoolean();

const array = (chain) =>
	chain.notEmpty().withMessage('Empty field value.').isArray().withMessage('Field value must be an array.');

const date = (chain) =>
	chain
		.notEmpty()
		.withMessage('Empty field value.')
		.isISO8601()
		.withMessage('Field value must be a date in ISO8601 format')
		.toDate();

const isIn = (chain, array) =>
	chain
		.notEmpty()
		.withMessage('Empty field value.')
		.isIn(array)
		.withMessage(`Field value must be one of [ ${array.toString()} ].`);

const email = (chain) =>
	chain
		.notEmpty()
		.withMessage('Empty field value.')
		.isEmail()
		.withMessage('Field value must be a valide email format');

const toArray = (chain) => chain.notEmpty().withMessage('Empty field value.').toArray();

module.exports = {
	params: {
		id: integer(param('id').exists().withMessage('Field required.').bail()),
	},
	query: {
		date: date(query(['from', 'to']).optional()),
	},

	pagination: [
		query('limit')
			.optional()
			.notEmpty()
			.withMessage('Empty field value.')
			.bail()
			.isInt({ min: 0 })
			.withMessage('Field value must be an integer & value >= 0.')
			.toInt(),
		query('offset')
			.optional()
			.notEmpty()
			.withMessage('Empty field value.')
			.bail()
			.isInt({ min: 0 })
			.withMessage('Field value must be an integer & value >= 0.')
			.toInt(),
		query('total').optional().isEmpty().withMessage('Field value must be empty.'),
	],

	integerRequired: (chain) => integer(chain.exists().withMessage('Field required.').bail()),
	integerOptional: (chain) => integer(chain.optional()),

	floatRequired: (chain) => float(chain.exists().withMessage('Field required.').bail()),
	floatOptional: (chain) => float(chain.optional()),

	stringRequired: (chain) => string(chain.exists().withMessage('Field required.').bail()),
	stringOptional: (chain) => string(chain.optional({ nullable: true })),

	booleanRequired: (chain) => boolean(chain.exists().withMessage('Field required.').bail()),
	booleanOptional: (chain) => boolean(chain.optional()),

	arrayRequired: (chain) => array(chain.exists().withMessage('Field required.').bail()),
	arrayOptional: (chain) => array(chain.optional()),

	toArrayRequired: (chain) => toArray(chain.exists().withMessage('Field required.').bail()),
	toArrayOptional: (chain) => toArray(chain.optional()),

	dateRequired: (chain) => date(chain.exists().withMessage('Field required.').bail()),
	dateOptional: (chain) => date(chain.optional()),

	isInRequired: (chain, array) => isIn(chain.exists().withMessage('Field required.').bail(), array),
	isInOptional: (chain, array) => isIn(chain.optional(), array),

	emailRequired: (chain) => email(chain.exists().withMessage('Field required.').bail()),
	emailOptional: (chain) => email(chain.optional()),

	phoneRequired: (chain) => phone(chain.exists().withMessage('Field required.').bail()),
	phoneOptional: (chain) => phone(chain.optional()),
};
