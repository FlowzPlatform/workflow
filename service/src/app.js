const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');

const handler = require('feathers-errors/handler');
// const feathers = require('@feathersjs/feathers');
// const express = require('@feathersjs/express');
// const configuration = require('@feathersjs/configuration');
// const rest = require('@feathersjs/express/rest');
// const socketio = require('@feathersjs/socketio');

// const handler = require('@feathersjs/express/errors');
const notFound = require('feathers-errors/not-found');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');

const rethinkdb = require('./rethinkdb');
const subscription = require('flowz-subscription');

const app = feathers();
// const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', feathers.static(app.get('public')));
// app.use('/', express.static(app.get('public')));

app.use(function(req, res, next) {
  this.apiHeaders = req.headers ;
  next();
 });

// Set up Plugins and providers
app.configure(hooks());
app.configure(rethinkdb);
app.configure(rest());
// app.configure(socketio());
app.configure(socketio(4033, {
  wsEngine: 'uws',
  origin: '*.flowz.com:*'
}));

app.use(subscription.featherSubscription)

// Set up our services (see `services/index.js`)
app.configure(services);
// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Configure a middleware for 404s and the error handler
app.use(notFound());
app.use(handler());

app.hooks(appHooks);

module.exports = app;
