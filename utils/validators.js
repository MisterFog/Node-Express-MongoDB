const {body} = require('express-validator/check'); 
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.registerValidators = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .custom(async (value, {req}) => {
      try {
        const user = await User.findOne({ email: value })
        if (user) {
          return Promise.reject('This email is already taken')
        }
      } catch (e) {
        console.log(e)
      }
    })
    .normalizeEmail(),
  body('password', 'Password must be at least 6 characters')
    .isLength({min: 6, max: 56})
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Passwords must match')
      }
      return true
    })
    .trim(),
  body('name')
    .isLength({min: 3}).withMessage('Name must be at least 3 characters')
    .trim()
];

exports.loginValidators = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .custom(async (value, {req}) => {
      try {
        const candidate = await User.findOne({ email: req.body.email });

        if (candidate) {
          const areSame = await bcrypt.compare(value, candidate.password);

          if (areSame) {
            req.session.user = candidate;
            req.session.isAuthenticated = true;
            req.session.save(err => {
              if(err){
                throw err;
              }
            });
          } else {
            return Promise.reject('Incorrect email or password!');
          }
        } else {
          return Promise.reject('This user does not exist!')
        }
      } catch (e) {
        console.log(e)
      }
    })
    .trim()
];


exports.courseValidators = [
  body('title').isLength({min: 3}).withMessage('The minimum name length is 3 characters').trim(),
  body('price').isNumeric().withMessage('Please enter a valid price'),
  body('img', 'Please enter a valid Url for the image').isURL()
];