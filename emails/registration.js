const keys = require('../keys');

module.exports = (to_email) => ({
	to: to_email,
	from: keys.FROM_EMAIL,
	subject: 'Account created!',
	html: `
	<h1>We're glad to welcome you!</h1>
	<p>You have successfully created an account with email - ${to_email}</p>
	<hr />
	<a href="${keys.BASE_URL}">Courses app</a>
	`,
});