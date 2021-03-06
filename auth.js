/**
 * @module auth
 */

const Config = require('./config'),
    jwt = require('jsonwebtoken'),
    passport = require('passport');

// local passport file
require('./passport');


/**
 * Function that generates the JWT token
 * @param {object} user The user object that will be encrypted in the payload of JWT
 * @returns the JWT token, with the user's username encoded in it.
 */
let generateJWTToken = (user) => {
    return jwt.sign(user, Config.JWT_SECRET, {
    subject: user.Username, // username you're encoding in the JWT
        // this specifies that token will expire in seven days
        expiresIn: '7d',
        // the algorithm used to sign/encode the values of JWT
        algorithm: 'HS256',
    });
}

/**
 * User login
 * @method POST
 * @param {string} endpoint - endpoint to add user. "url/login"
 * @param {string} Username - user's registered username
 * @param {string} Password - user's registered username
 * @returns {object} - user data
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        // res.setHeader ('Access-Control-Allow-Origin', '*');
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        // res.setHeader ('Access-Control-Allow-Origin', '*');
        // ES6 shorthand for res.json({ user: user, token: token}) - keys and values are the same
        return res.json({ user, token });
      });
    })(req, res);
  });
}