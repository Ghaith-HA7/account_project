const { Sequelize } = require('sequelize');
const _ = require('lodash');
const cls = require('cls-hooked');
const config = require('config');

/**
 * @type import('sequelize').Sequelize
 */
let sequelize;

if (!config.has('sequelize')) {
	sequelize = {
		authenticate: () => {
			throw new Error(`Config missing sequelize! example:
            sequelize:
                database: dbname
                username: root
                password: ''
                port: 3306
                host: localhost
        `);
		},
	};
} else {
	let sequelizeConfig = config.get('sequelize');
	sequelizeConfig = {
		..._.pick(sequelizeConfig, ['database', 'username', 'password', 'port', 'host', 'define']),
		dialect: 'mysql',
		logging: false,
	};

	if ((config.has('debug') && config.get('debug').sql) || require('args-parser')(process.argv).debug) {
		sequelizeConfig.logging = (msg) => console.debug(msg);
	}

	if (config.has('clsHooked') && config.get('clsHooked')) {
		const ns = cls.createNamespace('seqTransactions');
		Sequelize.useCLS(ns);
	}

	sequelize = new Sequelize(sequelizeConfig);
}

module.exports = sequelize;
