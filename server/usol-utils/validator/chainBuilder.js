const errorHandler = require('./errorHandler');

/**
 * Validation Chains Builder
 *
 * @param items
 * @param chains
 * @returns ValidationChain
 * @example
 * chainBuilder([integerOptional(query('deviceId')), body('x').exist()]);
 */
const chainBuilder = (chains = []) => chains.push(errorHandler) && chains;

module.exports = chainBuilder;
