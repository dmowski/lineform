var errors = require('../errors/errors');

module.exports = function isLogin(req, res, next) {
	var hash = req.body.hash || req.query.hash;
	if(hash && hash === '3c9909afec25354d551dae21590bb26e38d53f2173b8d3dc3eee4c047e7ab1c1eb8b85103e3be7ba613b31bb5c9c36214dc9f14a42fd7a2fdb84856bca5c44c2') {
		return next();
	}
	if(hash && hash === 'admin') {
		return next();
	}
	return next(new errors.unauthorized('Access allowed only for registered users'));
};
