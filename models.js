/**
 * @module models
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Schema for a movie
 */
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Descripton: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

/**
 * Schema for a movie
 */
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});


/**
 * Function that encrypts the password before storing it in the database
 * @name hashPassword
 * @param {string} password user's password from request
 * @returns {string} the encrypted password
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};


/**
 * Function that compares the encrypted password with password from the database
 * @name validatePassword
 * @param {string} password user's password from request
 * @returns {boolean} returns true or false 
 */
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};



// creates models that use the schemas defined
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);


// imports models into index.js file
module.exports.Movie = Movie;
module.exports.User = User;