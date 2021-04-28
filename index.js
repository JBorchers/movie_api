// imports express module locally
const express = require('express'),
  morgan = require('morgan');

// declares variable - used to route HTTP requests and responses
const app = express();

// invokes middleware function; uses morgan's 'common' format
app.use(morgan('common'));

app.use('/', express.static('public'));

// error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Uh oh, something broke!');
});

// source: https://editorial.rottentomatoes.com/guide/marvel-movies-in-order/
let topMovies = [
  {
    title: 'Captian America: The First Avenger',
    mainActor: 'Chris Evans',
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

// GET requests
app.get('/', (req, res) => {
  res.send('\"You have no idea what you\'re dealing with.\"<p>\"Uh... Shakespeare in the park? Doth mother know, you weareth her drapes?\"</p>');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});



// listening for requests
app.listen(8080, () => {
  console.log('My exercise 2.4 assigment is running on port 8080.');
});