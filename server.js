require("dotenv").config();

// Libraries and Frameworks
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');

// Sessions
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// Routes
const authRoutes = require('./routes/auth');
const websiteRoutes = require('./routes/website-routes');

// Mongoose - Connect app with the database
mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/fullstackapp', { useMongoClient: true }).then(() => {
  console.log('Connected to Mongo!');
}).catch((err) => {
  console.error('Error connecting to mongo', err);
});

const appName = require('./package.json').name;
const path = require('path');
const debug = require('debug')(`${appName}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: 'um bicudo sempre sera um bicudo',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }, // 1 hour
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

app.use((req, res, next) => {
  if (req.session.currentUser) {
    res.locals.currentUserInfo = req.session.currentUser;
    res.locals.isUserLoggedIn = true;
  } else {
    res.locals.isUserLoggedIn = false;
  }

  next();
});

// Express View engine setup

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'Bicos.com';

app.use('/', authRoutes);
app.use('/', websiteRoutes);

module.exports = app;
