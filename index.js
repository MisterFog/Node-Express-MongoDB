const express = require('express');
const path = require('path');
const csrf = require('csurf');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const Handlebars = require('handlebars');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const pathRoutes = require('./routes/index.js');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const fileMiddleware = require('./middleware/file');
const errorHandler = require('./middleware/error');
const keys = require('./keys');

const app = express();

const hbs = expressHandlebars.create({
	defaultLayout: 'main',
	extname: 'hbs',
	handlebars: allowInsecurePrototypeAccess(Handlebars),
	helpers: require('./utils/hbs-helpers'),
});

const store = new MongoStore({
	collection: 'sessions',
	uri: keys.MONGODB_URI
});

app.engine('hbs', hbs.engine); // registration handlebars
app.set('view engine', 'hbs');  // using handlebars
app.set('views', 'views');

// path to project assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// middleware
app.use(express.urlencoded({extended: true}));
app.use(session({
	secret: keys.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store
}));
app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash());
app.use(helmet()); // request headers for security
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

// routes
app.use('/', pathRoutes.homeRoutes);
app.use('/add', pathRoutes.addRoutes);
app.use('/courses', pathRoutes.coursesRoutes);
app.use('/card', pathRoutes.cardRoutes);
app.use('/orders', pathRoutes.ordersRoutes);
app.use('/auth', pathRoutes.authRouters);
app.use('/profile', pathRoutes.profileRouters);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

(async () => {
	try{
		mongoose.set('strictQuery', false);
		mongoose.connect(keys.MONGODB_URI, {useNewUrlParser: true});

		app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
	}catch(e){
		console.log(e);
	}
})();




