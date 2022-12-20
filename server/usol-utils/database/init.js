const sequelize = require('./sequelize');

let models = [];

const init = () => {
	models = models.sort((a, b) => {
		if (a.skipSync == b.skipSync) return 0;
		if (a.skipSync) return -1;
		else return 1;
	});

	for (let i = 0; i < models.length; i++) {
		models[i].initialize();
	}
};

const sync = async (opts) => {
	await sequelize.sync(opts);
};

const associate = () => {
	for (let i = 0; i < models.length; i++) {
		models[i].associate();
	}
};

const initialize = () => {
	init();
	associate();
};

exports.pushModel = (model) => {
	models.push(model);
};
exports.initModels = init;
exports.associateModels = associate;
exports.syncModels = sync;
exports.initialize = initialize;
