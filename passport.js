/**
 * @module passport
 */

const passport = require('passport'),
// defines basic HTTP authentication for login requests
LocalStrategy = require('passport-local').Strategy,
Models = require('./models.js'),
passportJWT = require('passport-jwt');
const Config = require('./config');

let Users = Models.User,
JWTStrategy = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJwt;


/**
 * This strategy is used by the '/login' route to check if a user exists in database
 * @name LocalStrategy
 * @memberof module:passport
 * @param {func} - LocalStrategy authentication method form Passport 
 * @param {callback} - callback for authenticating a user using LocalStrategy
 * @throws will throw an error if the authentication does not succeed
 * @throws will throw an error if the user does not exist in database
 * @throws will throw an error if the password is incorrect
 * @returns {object} an object with user's details
 */
passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, (username, password, callback) => {
    console.log(username + '  ' + password);
    Users.findOne({ Username: username }, (error, user) => {
        if (error) {
            console.log(error);
            return callback(error);
        }
        
        if (!user.validatePassword(password)) {
            console.log('incorrect username');
            return callback(null, false, {message: 'Incorrect username or password.'});
        }
        
        console.log('finished');
        return callback(null, user);
    });
}));


/**
 * This strategy is used for authorization between each request.
 * Checks user's request against the database using the user's id extracted from the JWT.
 * @name JWTStrategy
 * @param {func} - JWTStrategy authorization method form Passport 
 * @param {callback} - callback for authorizing a user using JWTStrategy
 * @throws will throw an error if the authorization does not succeed
 * @returns {object} an object with user's details
 */
passport.use(new JWTStrategy({
    // JWT is extracted from the header of the HTTP request
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    // verifies signature
    secretOrKey: Config.JWT_SECRET
    // secretOrKey: process.env.JWT_SECRET
}, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
    .then((user) => {
        return callback(null, user);
    })
    .catch((error) => {
        return callback(error)
    });
}));