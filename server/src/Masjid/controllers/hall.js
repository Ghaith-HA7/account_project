const _ = require('lodash');
const HallService = require('../services/hall');
const { statusCodes } = require('usol-utils');

module.exports = {
	/** Add a new hall */
	save: async (req, res) => {
		const data = req.body;
		const masjidId = req.params.id;
		const result = await new HallService(data).save(masjidId);
		res.status(statusCodes.CREATED).json(result);
	},

	/** Update masjid hall */
	update: async (req, res) => {
		const { hallId } = req.params;
		const data = req.body;
		await new HallService(data).update(hallId);
		res.sendStatus(statusCodes.UPDATED);
	},

	generateCode: async (req, res) => {
		const masjidId = req.params.id;
		const { hallId, prayerId } = req.query;
		const data = await HallService.generateCode(masjidId, hallId, prayerId);
		return res.status(statusCodes.CREATED).json(data);
	},

	removeCode: async (req, res) => {
		const masjidId = req.params.id;
		const { hallId, prayerId } = req.query;
		const data = await HallService.removeCode(masjidId, hallId, prayerId);
		return res.status(statusCodes.DELETED).json(data);
	},

	/** Delete masjid hall */
	delete: async (req, res) => {
		const { hallId } = req.params;
		const result = await HallService.delete(hallId);
		res.status(statusCodes.DELETED).json(result);
	},

	/** Get Masjid Halls */
	getMasjidHalls: async (req, res) => {
		const query = _.pick(req.query, ['limit', 'offset', 'prayerId', 'date']);
		const { id } = req.params;
		const result = await HallService.getMasjidHalls(req.user, id, query);
		res.status(statusCodes.OK).json(result);
	},
};
