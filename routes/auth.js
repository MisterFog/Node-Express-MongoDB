const {Router} = require('express');
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const {validationResult} = require('express-validator/check');
const {registerValidators, loginValidators} = require('../utils/validators')
const sgMail = require('@sendgrid/mail');
const keys = require('../keys');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = Router();
const User = require('../models/user');

sgMail.setApiKey(keys.SEND_GRID_API_KEY);

const transporter = nodemailer.createTransport(nodemailerSendgrid( 
	{
		apiKey: keys.SEND_GRID_API_KEY
	})
);

router.get('/login', async (req, res) => {
	try{
		res.render('auth/login',{
			title: 'Authorisation',
			isLogin: true,
			registerError: req.flash('registerError'),
			loginError: req.flash('loginError'),
		});
	}catch(e){
		console.log(e);
	}
});

router.get('/reset', async (req, res) => {
	try{
		res.render('auth/reset',{
			title: 'Forgot your password?',
			isLogin: true,
			resetPasswordError: req.flash('resetPasswordError'),
		});
	}catch(e){
		console.log(e);
	}
});

router.get('/logout', async (req, res) => {
	try{
		req.session.destroy(() => {
			res.redirect('/auth/login#login')
		})
	}catch(e){
		console.log(e);
	}
});

router.get('/password/:token', async (req, res) => {
	if (!req.params.token) {
		return res.redirect('/auth/login#login');
	}

	try {
		const user = await User.findOne({
			resetToken: req.params.token,
			resetTokenExp: {$gt: Date.now()}
		});

		if (!user) {
			return res.redirect('/auth/login#login')
		} else {
			res.render('auth/password', {
			title: 'Restore access',
			error: req.flash('errorCreateNewPassword'),
			userId: user._id.toString(),
			token: req.params.token
			});
		};
	} catch (e) {
		console.log(e)
	}	
});

router.post('/login', loginValidators, async (req, res) => {
	try{
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(422).render('auth/login', {
				title: 'Authorisation',
				isLogin: true,
				loginError: req.flash('loginError', errors.array()[0].msg),
				data: {
					email: req.body.email,
					password: req.body.password,
				}
			})
		}else{
			return res.status(200).redirect('/');
		};
	}catch(e){
		console.log(e);
	}
});

router.post('/register', registerValidators, async (req, res) => {
	try{
		const {email, password, name} = req.body;

		const errors = validationResult(req);
		
		if (!errors.isEmpty()) {
			req.flash('registerError', errors.array()[0].msg)
			return res.status(422).redirect('/auth/login#register')
		}

		const hashPassword = await bcrypt.hash(password, 10);
		const user = new User({
			email, 
			name, 
			password: hashPassword, 
			curt: {items: []},
		});

		await user.save();

		res.redirect('/auth/login#login');
		
		await transporter
			.sendMail(regEmail(email))
			.then(([res]) => {
				console.log('Message delivered with code %s %s', res.statusCode, res.statusMessage);
			})
			.catch(err => {
				console.log('Errors occurred, failed to deliver message');
		
				if (err.response && err.response.body && err.response.body.errors) {
					err.response.body.errors.forEach(error => console.log('%s: %s', error.field, error.message));
				} else {
					console.log(err);
				}
			});		
	}catch(e){
		console.log(e);
	}
});

router.post('/reset', (req, res) => {
	try {
		crypto.randomBytes(32, async (err, buffer) => {
			if (err) {
				req.flash('resetPasswordError', 'Something went wrong, please try again later.')
				return res.redirect('/auth/reset')
			}
	
			const token = buffer.toString('hex');
			const candidate = await User.findOne({email: req.body.email});
	
			if (candidate) {
				candidate.resetToken = token;
				candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
				await candidate.save();

				await transporter
				.sendMail(resetEmail(candidate.email, token))
				.then(([res]) => {
					console.log('Message delivered with code %s %s', res.statusCode, res.statusMessage);
				})
				.catch(err => {
					console.log('Errors occurred, failed to deliver message');
			
					if (err.response && err.response.body && err.response.body.errors) {
						err.response.body.errors.forEach(error => console.log('%s: %s', error.field, error.message));
					} else {
						console.log(err);
					}
				});

				res.redirect('/auth/login#login');
			} else {
				req.flash('resetPasswordError', 'There isn`t such email.');
				res.redirect('/auth/reset');
			}
		});
	} catch (e) {
		console.log(e);
	}
});

router.post('/password', async (req, res) => {
	try {
		const user = await User.findOne({
			_id: req.body.userId,
			resetToken: req.body.token,
			resetTokenExp: {$gt: Date.now()}
		});
	
		if (user) {
			user.password = await bcrypt.hash(req.body.password, 10);
			user.resetToken = undefined;
			user.resetTokenExp = undefined;
			await user.save();
			res.redirect('/auth/login#login');
		} else {
			req.flash('loginError', 'Token has expired');
			res.redirect('/auth/login#login');
		};
	} catch (e) {
		console.log(e);
	}
})

module.exports = router;