// this has to be the same key used in the JWTStrategy
const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
  passport = require('passport');

// local passport file
require('./passport');

// used if username and password exist in database
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // username you're encoding in the JWT
        // this specifies that token will expire in seven days
        expiresIn: '7d',
        // the algorithm used to sign/encode the values of JWT
        algorithm: 'HS256',
    });
}

// POST login
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        res.setHeader ('Access-Control-Allow-Origin', '*');
        // ES6 shorthand for res.json({ user: user, token: token}) - keys and values are the same
        return res.json({ user, token });
      });
    })(req, res);
  });
}