const mongoose = require('mongoose');
const Models = require('./models.js');

// model names defined in models.js
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;

mongoose.connect('mongodb://localhost:27017/myFlixDB', 
{ useNewUrlParser: true, useUnifiedTopology: true });

// imports express module locally
const express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
uuid = require('uuid');


// declares variable - used to route HTTP requests and responses
const app = express();
app.use(express.json());
// old code? Replaced by above code?
app.use(bodyParser.json());

// invokes middleware function; uses morgan's 'common' format
app.use(morgan('common'));

app.use('/', express.static('public'));



// error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Uh oh, something broke!');
});

// Express codes to route endpoints
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!!');
});

// return all movies
app.get('/movies', (req, res) => {
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
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title : req.params.Title }).then((movie) => {
    res.status(201).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

// get movies by genre (title?)
app.get('/movies/:genres', (req, res) => {
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
app.get('/movies/genre/:genre', (req, res) => {
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
app.get('/directors', (req, res) => {
  Movies.find({ Name : req.params.Name}).then((director) => {
    res.status(201).json(director.Director);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

// get director by name
app.get('/directors/:name', (req, res) => {
  Movies.findOne({'director.name' : req.params.Name}).then((director) => {
    res.status(201).json(director.Director);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

// registers a new user
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + 'already exists');
    } else {
      Users
      .create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) =>{res.status(201).json(user) })
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
app.get('/users', (req, res) => {
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
app.get('/users/:Username', (req, res) => {
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
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
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
app.post('/users/:Username/Movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username/Movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username', (req, res) => {
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
app.listen(8080, () => {
  console.log('My project is running on port 8080.');
});