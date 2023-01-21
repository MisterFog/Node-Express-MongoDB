const homeRoutes = require('./home.js');
const addRoutes = require('./add.js');
const coursesRoutes = require('./courses.js');
const cardRoutes = require('./card.js');
const ordersRoutes = require('./orders.js');
const authRouters = require('./auth.js');
const profileRouters = require('./profile.js');

module.exports = {
	cardRoutes,
	homeRoutes,
	addRoutes,
	coursesRoutes,
	ordersRoutes,
	authRouters,
	profileRouters
};