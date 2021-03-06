/**
 * Express configuration
 */

'use strict';

var express = require('express');
var favicon = require('static-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');<% if (filters.auth) { %>
var passport = require('passport');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);<% } %>

module.exports = function(app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');<% if (filters.html) { %>
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');<% } %><% if (filters.jade) { %>
  app.set('view engine', 'jade');<% } %>
  app.use(compression());
  app.use(bodyParser());
  app.use(methodOverride());
  app.use(cookieParser());
  <% if (filters.auth) { %>app.use(passport.initialize());<% } %><% if (filters.auth) { %>

  // Persist sessions with mongoStore
  app.use(session({
    secret: config.secrets.session,
    store: new mongoStore({
      url: config.mongo.uri,
      collection: 'sessions'
    }, function () {
      console.log('db connection open' );
    })
  }));<% } %>

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', config.root + '/public');
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', 'client');
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }
};