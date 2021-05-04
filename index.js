// imports express module locally
const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');
  ;

// declares variable - used to route HTTP requests and responses
const app = express();

// invokes middleware function; uses morgan's 'common' format
app.use(morgan('common'));

app.use('/', express.static('public'));

app.use(bodyParser.json());

// error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Uh oh, something broke!');
});

// source: https://editorial.rottentomatoes.com/guide/marvel-movies-in-order/
let movies = [
  {
    title: 'Captian America: The First Avenger',
    mainActor: 'Chris Evans',
    genre: 'Action',
    releaseDate: 2011,
    director: 'Joe Johnston'
  },
  {
    title: 'Captain Marvel',
    mainActor: 'Anna Boden',
    releaseDate: 2019,
    director: 'Anna Boden'
  },
  {
    title: 'Iron Man',
    mainActor: 'Robert Downey Jr',
    releaseDate: 2008,
    director: 'n/a'
  },
  {
    title: 'Iron Man 2',
    mainActor: 'Robert Downey Jr',
    releaseDate: 2010,
    director: 'n/a'
  },
  {
    title: 'The Incredible Hulk',
    mainActor: 'Edward Norton',
    releaseDate: 2008,
    director: 'Louis Leterrier'
  },
  {
    title: 'Thor',
    mainActor: 'Chris Hemsworth',
    releaseDate: 2011,
    director: 'Kenneth Branagh'
  },
  {
    title: 'Marvel\'s The Avengers',
    mainActor: 'n/a',
    releaseDate: 2012,
    director: 'n/a'
  },
  {
    title: 'Iron Man 3',
    mainActor: 'Robert Downey Jr',
    releaseDate: 2013,
    director: 'Shane Black'
  },
  {
    title: 'Thore: The Dark World',
    mainActor: 'Chris Hemsworth',
    releaseDate: 2013,
    director: 'Alan Taylor'
  },
  {
    title: 'Captain America: The Winter Soldier',
    mainActor: 'Chris Evans',
    releaseDate: 2014,
    director: 'Joe Russo'
  },
];

let directors = [
  {
    name: 'Director A',
    bio: '',
    birthYear: '',
    deathYear: ''
  },
  {
    name: 'Director B',
    bio: '',
    birthYear: '',
    deathYear: ''
  },
  {
    name: 'Director C',
    bio: '',
    birthYear: '',
    deathYear: ''
  }
];

// Express codes to route endpoints
app.get('/', (req, res) => {
  res.send('\"You have no idea what you\'re dealing with.\"<p>\"Uh... Shakespeare in the park? Doth mother know, you weareth her drapes?\"</p>');
});

app.get('/movies', (req, res) => {
  res.json(movies);
});

// gets data about a specific movie
app.get('/movies/:descriptions', (req, res) => {
  res.json(movies.find((movies) =>
    { return movies.title === req.params.title }));
});

app.get('/movies/:genres', (req, res) => {
  res.json(genres);
});

app.get('/directors', (req, res) => {
  res.json(directors);
});

// registers a new user
app.post('/users', (req, res) => {
  let newUser = req.body;

  if(!newUser.name) {
    const message = 'Missing name in request body';
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);
  }
});

app.put('/users/:username', (req, res) => {
  res.send('Your username has been updated.')
})

app.post('/users/:username/favorites', (req, res) => {
  res.send('[movie] has been added to your list!')
})

app.delete('/users/:username/favorites/movies', (req, res) => {
  res.send('[movie] has been removed from your list.')
})

app.delete('/users/:username', (req, res) => {
  res.send('Your profile was successfully removed')
})


// listening for requests
app.listen(8080, () => {
  console.log('My project is running on port 8080.');
});