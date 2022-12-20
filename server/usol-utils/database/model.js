const { Model } = require('sequelize');
const { pushModel } = require('./init');
const { query } = require('./sequelize');

class BaseModel extends Model {
	static skipSync = false;

	/**
	 *
	 * @param {object} queryOptions This is passed to findAll or findAndCountAll
	 * @param {object} paginationOptions
	 * @param {any} [paginationOptions.total]
	 * @param {Number} [paginationOptions.limit] Pass null for unlimited data fetching
	 * @param {Number} [paginationOptions.offset]
	 * @returns {{totalRecords?: Number,data: Array<object>}}
	 */
	static async paginate(queryOptions = {}, paginationOptions = {}) {
		const result = {};
		paginationOptions.limit != null && (queryOptions.limit = paginationOptions.limit ?? 50);
		queryOptions.offset = paginationOptions.offset ?? 0;
		if (paginationOptions.total != undefined) {
			const { count, rows } = await this.findAndCountAll(queryOptions);
			Object.assign(result, { totalRecords: count, data: rows });
		} else {
			result.data = await this.findAll(queryOptions);
		}
		return result;
	}

	static associate() {
		throw new Error(`${this.name} does not implement associate, associate should define all relations here`);
	}

	static initialize() {
		throw new Error(`${this.name} does not implement associate, associate should define all relations here`);
	}

	static register() {
		pushModel(this);
	}
}

module.exports = BaseModel;
