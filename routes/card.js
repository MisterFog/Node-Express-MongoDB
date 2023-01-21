const {Router} = require('express');
const Courses = require('../models/course');
const auth = require('../middleware/auth');
const router = Router();

const mapCartItems = (cart) => cart.items.map(item => (
	{
		...item.courseId._doc, 
		count: item.count, 
		id: item.courseId.id
	}));
const computePrice = (courses) => courses.reduce((total, course) => (total += course.price * course.count), 0);

router.post('/add', auth, async(req, res) => {
	const course = await Courses.findById(req.body.id);

	await req.user.addToCart(course);

	res.redirect('/card');
});

router.get('/', auth, async (req, res) => {
	const user = await req.user
	.populate('cart.items.courseId');

	const courses = mapCartItems(user.cart);
	const price = computePrice(courses);

	res.render('card', {
		title: 'Basket',
		isCard: true,
		courses: courses,
		user: req.user.toObject(),
		price: price
	})
});

router.delete('/remove/:id', auth, async (req, res) => {
	await req.user.removeFromCart(req.params.id);
	const user = await req.user.populate('cart.items.courseId');
	const courses = mapCartItems(user.cart);
	res.status(200).json({courses, price: computePrice(courses)});
});

module.exports = router;