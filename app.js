/* app.js
 * The entry point for the app server.
 */

var auth_module = require('./auth');
var config = require('./config');
var express = require('express');
var handlers = require('./handlers');
var database = require('./database');
var models_module = require('./models');
var winston = require('winston');
var logging = require('./logging');
var rooms = require('./rooms');

logging.init();

var app = express();

app.configure(function() {
  database.init(app, models_module.define, function(models) {
    rooms.init(models, function() {
      handlers.init(app, auth_module.init(app));
      app.listen(config.web.port, function() {
        winston.info('Server listening on port', config.web.port);
      });
    });
  });
});

