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

// // CORS - limit allowed origings:
// let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
// app.use(cors({
//   origin: (origin, callback) => {
//     if(!origin) return callback(null, true);
//     if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
//       let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
//       return callback(new Error(message ), false);
//     }
//     return callback(null, true);
//   }
// }));

// dotenv.config();

app.use(morgan('common'));
app.use(express.static('public'));
app.use(express.json());
// app.use(bodyParser.json());

let auth = require('./auth')(app);

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;

// LOCAL HOST
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

//MongoDB Atlas HOST
mongoose.connect(Config.CONNECTION_URI, { 
// mongoose.connect(process.env.CONNECTION_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
 });


// error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Uh oh, something broke!');
});


// Express codes to route endpoints
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});


// return all movies
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

// gets data about a specific movie
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title : req.params.Title }).then((movie) => {
    res.status(201).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

// get movies by genre (title?)
app.get('/movies/:genres', passport.authenticate('jwt', { session: false }), (req, res) => {
  Genres.findOne({ Name : req.params.Name })
  .then((movie) => {
    res.status(201).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


// return data about genre
app.get('/movies/genre/:genre', passport.authenticate('jwt', { session: false }), (req, res) => {
  Genres.findOne({ 'Genre.Name' : req.params.Name })
  .then((genre) => {
    res.status(201).json(genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// get all directors
app.get('/directors', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ Name : req.params.Name}).then((director) => {
    res.status(201).json(director.Director);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

// get director by name
app.get('/directors/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({'Director.Name' : req.params.name})
  .then(director => res.status(201).json(director.Director))
  .catch(err => res.status(500).send('Error: ' + err));
});

// app.get('/directors/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
//   try {
//     let director = await Movies.findOne({'Director.Name' : req.params.name});
//     res.status(201).json(director.Director);
//   } catch(err) {
//     res.status(500).send('Error: ' + err);
//   }
// });


// register a new user
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


// get all users
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

// Get a user by username
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

// update existing user info
// [
// check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
// check('Username', 'Username is required').isLength({min: 5}),
// check('Password', 'Password is required').not().isEmpty(),
// check('Email', 'Email does not appear to be valid').isEmail()],

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
      updateObject.Password = req.body.Password
    }
    if (req.body.Email) {
      updateObject.Email = req.body.Email
    }
    if (req.body.Birthday) {
      updateObject.Birthday = req.body.Birthday
    }

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


// add movie to user's favorites list
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

// removes movie from favorites list
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

// Delete user by username
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