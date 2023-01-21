const keys = require('../keys');

module.exports = (to_email, token) => ({
    to: to_email,
    from: keys.FROM_EMAIL,
    subject: 'Access restoration',
    html: `
      <h1>Have you forgotten your password?</h1>
      <p>If not, please ignore this email.</p>
      <p>Otherwise click on the link below:</p>
      <p><a href="${keys.BASE_URL}/auth/password/${token}">Restore access</a></p>
      <hr />
      <a href="${keys.BASE_URL}">Courses app</a>
    `
  });