/**
 *
 * @param options
 * @param {number} options.digits
 * @param {number} options.count
 * @param {number[]} options.exclude
 * @returns {number[]|number}
 */
module.exports = (options = {}) => {
	const defaultOptions = { digits: 6, count: 1, exclude: [] };
	options = {
		...defaultOptions,
		...options,
	};
	options.exclude = new Set(options.exclude);

	if (options.count === 1) {
		let random = getRandom(options.digits);
		while (options.exclude.has(random)) random = getRandom(options.digits);
		return random;
	}
	const result = new Set();
	while (options.count--) {
		let random = getRandom(options.digits);
		while (result.has(random) || options.exclude.has(random)) random = getRandom(options.digits);
		result.add(random);
	}
	return Array.from(result);
};

const getRandom = (digits) => {
	const x = parseInt(`1${''.padStart(digits - 1, '0')}`);
	const y = parseInt(`9${''.padStart(digits - 1, '0')}`);
	return Math.floor(x + Math.random() * y);
};
