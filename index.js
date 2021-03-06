/**
 * @module index
 */

require("dotenv").config()

const express = require('express'),
	morgan = require('morgan'),
  uuid = require('uuid'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  // dotenv = require('dotenv'),
  passport = require('passport'),
  app = express(),
  Config = require('./config');

const { check, validationResult } = require('express-validator');

require('./passport');

// allows requests from all origins
app.use(cors());



app.use(morgan('common'));
app.use(express.static('public'));
app.use(express.json());
// app.use(bodyParser.json());

let auth = require('./auth')(app);

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;


//MongoDB Atlas HOST
mongoose.connect(Config.CONNECTION_URI, { 
// mongoose.connect(process.env.CONNECTION_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
 });


//---------------------error handling middleware------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Uh oh, something broke!');
});


/**
 * Get the welcome page
 * @method GET
 * @param {string} endpoint - endpoint to load the welcome page. "url/"
 * @returns {object} - returns the welcome page
 */
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

//---------------------movie requests------------
/**
 * Get all movies
 * @method GET
 * @param {string} endpoint - endpoint to fetch movies. "url/movies"
 * @returns {object} - returns the movie object
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), 
(req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


/**
 * Get movies by title
 * @method GET
 * @param {string} endpoint - endpoint - fetch movies by title
 * @param {string} Title - is used to get specific movie "url/movies/:Title"
 * @returns {object} - returns the movie with specific title
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title : req.params.Title }).then((movie) => {
    res.status(201).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});


/**
 * Get all genres
 * @method GET
 * @param {string} endpoint - endpoint to fetch genres. "url/movies/:genres"
 * @returns {object} - returns the genre object
 */
app.get('/movies/:genres', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Name : req.params.Name })
  .then((movie) => {
    res.status(201).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


/**
 * Get genre by name
 * @method GET
 * @param {string} endpoint - endpoint - fetch genre by name
 * @param {string} Name - is used to get specific genre "url/genre/:name"
 * @returns {object} - returns a specific genre
 */
app.get('genre/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name' : req.params.name })
  .then(genre => {res.status(201).json(genre.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


/**
 * Get all directors
 * @method GET
 * @param {string} endpoint - endpoint to fetch directors. "url/directors"
 * @returns {object} - returns the directors object
 */
app.get('/directors', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ Name : req.params.Name})
  .then((director) => {
    res.status(201).json(director.Director);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});


/**
 * Get director by name
 * @method GET
 * @param {string} endpoint - endpoint - fetch director by name
 * @param {string} Name - is used to get specific director "url/directors/:name"
 * @returns {object} - returns a specific director
 */
app.get('/directors/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({'Director.Name' : req.params.name})
  .then(director => res.status(201).json(director.Director))
  .catch(err => res.status(500).send('Error: ' + err));
});


//---------------------favorite movie requests------------
/**
 * Add movie to favorites list
 * @method POST
 * @param {string} endpoint - endpoint to add movies to favorites list "url/users/:Username/Movies/:MovieID"
 * @param {string} Title, Username - both are required
 * @returns {string} - returns success/error message
 */
app.post('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    // adds movie onto end of array of FavoriteMovies
    $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


/**
 * Delete movie from favorites
 * @method DELETE
 * @param {string} endpoint - endpoint to remove movies from favorites "url//users/:Username/Movies/:MovieID"
 * @param {string} Title Username - both are required
 * @returns {string} - returns success/error message
 */
app.delete('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


//---------------------user requests------------
/**
 * Register user
 * @method POST
 * @param {string} endpoint - endpoint to add user. "url/users"
 * @param {string} Username - choosen by user
 * @param {string} Password - user's password
 * @param {string} Email - user's email adress
 * @param {string} Birthday - user's birthday
 * @returns {object} - new user
 */
app.post('/users', [
check('Username', 'Check - Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
check('Username', 'Username is required').isLength({min: 5}),
check('Password', 'Password is required').not().isEmpty(),
check('Email', 'Email does not appear to be valid').isEmail()
], 
(req, res) => {
  // check validation object for errors
  let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
  // search to see if user with requested username already exists
  .then((user) => {
    if (user) {
      // if user is found, send a response that it already exists
      return res.status(400).send(req.body.Username + 'already exists');
    } else {
      Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) => { 
        res.status(201).json(user);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});


/**
 * Get all users
 * @method GET
 * @param {string} endpoint - endpoint to fetch users. "url/users"
 * @returns {object} - returns the users object
 */
app.get('/users', 
// passport.authenticate('jwt', { session: false }), 
(req, res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


/**
 * Get user by username
 * @method GET
 * @param {string} endpoint - endpoint - fetch user by username
 * @param {string} Username - is used to get specific user "url/users/:Username"
 * @returns {object} - returns a specific user
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  // to "read" a user by username, pass an object that contains that criteria ("username")
  Users.findOne({ Username: req.params.Username })
  .then((users) => {
    res.json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


/**
 * Update user data
 * @method PUT
 * @param {string} endpoint - endpoint to update user. "url/users/:Username"
 * @param {string} Username - new username
 * @param {string} Password - new password
 * @param {string} Email - new email adress
 * @param {string} Birthday - new birthday
 * @returns {object} - new user data
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),  (req, res) => {
  // check validation object for errors
  let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    };

    // Hash the submitted password
    let hashedPassword = Users.hashPassword(req.body.Password);
    let updateObject = {}
    if (req.body.Username) {
      updateObject.Username = req.body.Username
    }
    if (req.body.Password) {
      updateObject.Password = hashedPassword
    }
    if (req.body.Email) {
      updateObject.Email = req.body.Email
    }
    if (req.body.Birthday) {
      updateObject.Birthday = req.body.Birthday
    }
    console.log('updateObject', updateObject)

  Users.findOneAndUpdate({ Username: req.params.Username }, { $set: updateObject },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


/**
 * Delete user by username
 * @method DELETE
 * @param {string} endpoint - endpoint - delete user by username
 * @param {string} Username - is used to delete specific user "url/users/:Username"
 * @returns {string} success/error message
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username})
  .then((user) => {
    if(!user) {
      res.status(400).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' was deleted');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});



// listening for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on port ' + port);
});