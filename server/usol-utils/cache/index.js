const config = require('config');
const redis = require('redis');
let redisInitialized = false;
let redisInitializing = false;
/**
 * @type {import('redis').RedisClient}
 */
let client = null;

function sleep(ms) {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(), ms);
	});
}

async function waitForRedisToInit() {
	while (redisInitializing) {
		await sleep(100);
	}
}

if (config.has('redis')) {
	redisInitializing = true;
	const redisConfig = config.get('redis');
	client = redis.createClient({
		host: redisConfig.host,
		port: redisConfig.port,
	});
	client.on('connect', async () => {
		redisInitialized = true;
		redisInitializing = false;
	});
	client.on('error', (err) => {
		console.error(err);
	});
} else {
	console.warn('Caching disabled');
}

/**
 * Sets a value into the cache server
 * @param {String} key
 * @param {String | Date | Buffer | Number} value
 * @param {Number} [expiresIn] seconds
 */
async function set(key, value, expiresIn) {
	if (redisInitializing) {
		await waitForRedisToInit();
	}
	if (redisInitialized) {
		await new Promise((resolve, reject) => {
			client.set(key, value, (err) => {
				if (err) reject(err);
				else {
					if (expiresIn) client.expire(key, expiresIn);
					resolve();
				}
			});
		});
	}
}

/**
 * Sets an object or an array value into the cache server
 * @param {String} key
 * @param {Object| Array} value
 * @param {Number} [expiresIn] seconds
 */
async function setObject(key, value, expiresIn) {
	await new Promise((resolve, reject) => {
		if (typeof value !== 'object') reject();
		else {
			set(key, JSON.stringify(value), expiresIn);
			resolve();
		}
	});
}

/**
 * If the value isn't found in the cache server, the callback is used to get the value and cache it
 * @param {String} key
 * @param {Function} notFoundCallback
 * @param {Number}[expiresIn]
 */
async function get(key, notFoundCallback, expiresIn) {
	if (redisInitializing) {
		await waitForRedisToInit();
	}
	if (redisInitialized) {
		return new Promise((resolve, reject) => {
			client.get(key, async (err, reply) => {
				if (err) console.error(err);
				if (reply == null) {
					let value = await notFoundCallback();
					if (typeof value === 'object') await setObject(key, value);
					else await set(key, value, expiresIn);
					resolve(value);
				} else resolve(reply);
			});
		});
	} else {
		return await notFoundCallback();
	}
}

/**
 * If the not found callback return value isn't a string, it won't be returned
 * @param {String} key
 * @param {Function} notFoundCallback
 * @param {Number}[expiresIn]
 * @return {Promise<String | null>} null if value does not exist
 */
async function getString(key, notFoundCallback, expiresIn) {
	let value = await get(key, notFoundCallback, expiresIn);
	if (value) {
		if (typeof value === 'object') return JSON.stringify(value);
		else return value.toString();
	} else return null;
}

/**
 * If the not found callback return value isn't a number, it won't be returned
 * @param {String} key
 * @param {Function} notFoundCallback
 * @param {Number}[expiresIn]
 * @return {Promise<Number | null>} null if value is not a number or value does not exist
 */
async function getNumber(key, notFoundCallback, expiresIn) {
	let value = await get(key, notFoundCallback, expiresIn);
	if (value && Number(value)) return Number(value);
	else return null;
}

/**
 * If the not found callback return value isn't an object, it won't be returned
 * @param {String} key
 * @param {Function} notFoundCallback
 * @param {Number}[expiresIn]
 * @return {Promise<Object | null>} null if value is not an object or value does not exist
 */
async function getObject(key, notFoundCallback, expiresIn) {
	let value = await get(key, notFoundCallback, expiresIn);
	if (value) {
		if (typeof value === 'object') return value;
		let object;
		try {
			object = JSON.parse(value);
		} catch (e) {
			return null;
		}
		return object;
	} else return null;
}

/**
 * If the not found callback return value isn't an array, it won't be returned
 * @param {String} key
 * @param {Number}[expiresIn]
 * @param {Function} notFoundCallback
 * @return {Promise<Array | null>} null if value is not an array or value does not exist
 */
async function getArray(key, notFoundCallback, expiresIn) {
	let value = await get(key, notFoundCallback, expiresIn);
	if (value) {
		if (Array.isArray(value)) return value;
		let object;
		try {
			object = JSON.parse(value);
		} catch (e) {
			return null;
		}
		if (Array.isArray(object)) return object;
		else return null;
	} else return null;
}

/**
 * Delete a key/value pair from the cache server
 * @param {Array<String> | String} keys
 */
function del(keys) {
	if (redisInitialized) {
		if (!Array.isArray(keys)) keys = [keys];
		redis.del(keys);
	}
}

module.exports = {
	set,
	get,
	del,
	getString,
	getNumber,
	getObject,
	getArray,
	setObject,
};
