module.exports = async (req, res, next) => {
	res.locals.supressLogs = true;
	next();
};
