'use strict';

Promise = require('bluebird');
var settings = require('./settings');
var settings = settings;

var Slackbot = require('slackbot');
var slackbot = new Slackbot(settings.slackTeam, settings.slackbot);
Promise.promisifyAll(slackbot);

var flash = require('connect-flash');
var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var serveFavicon = require('serve-favicon');
var compression = require('compression');
var serveStatic = require('serve-static');
var errorhandler = require('errorhandler');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var busboy = require('connect-multiparty');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var AdminUser = require('./models').AdminUser;
var User = require('./models').User;

var routes = require('./routes');

Promise.promisifyAll(mongoose);
mongoose.set('debug', settings.mongooseDebug);

exports.server = function() {
  var app = express();
  app.use(cookieParser(settings.cookieSecret));
  // development only
  if ('development' === app.get('env')) {
    app.use(errorhandler());
  }
  app.use(session({
    store: new RedisStore(settings.session.redis),
    resave: false,
    secret: settings.sessionSecret,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000
    }
  }));
  app.use(flash({
    host: settings.session.redis.host,
    port: settings.session.redis.port,
    app: app
  }));

  app.set('port', settings.port || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(morgan('dev'));
  app.use(compression());
  app.use(serveFavicon(__dirname + '/public/favicon.ico'));

  app.use(busboy({
    highWaterMark: 2 * 1024 * 1024,
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  }));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    return User
      .findOneAsync({
        _id: id
      })
      .then(function(user) {
        return done(null, user);
      })
      .error(function(err) {
        return done(err, null);
      });
  });

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      AdminUser.isValidUserPassword(email, password, done);
    }));

  passport.use(new FacebookStrategy({
      clientID: settings.facebook.clientID,
      clientSecret: settings.facebook.clientSecret,
      callbackURL: settings.facebook.callbackURL,
      profileFields: ['id', 'emails','displayName','photos']
    },
    function(accessToken, refreshToken, profile, done) {
      profile.authOrigin = 'facebook';
      User.findOrCreateOAuthUser(profile, function(err, user) {
        return done(err, user);
      });
    }));

  app.use(methodOverride('_method'));

  app.use(serveStatic(path.join(__dirname, 'public'), {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }));

  routes(app);
  // all environments
  app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(500).send('Something broken!');
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    next();
  });

  var mongoURI;
  //connect to mongodb
  if (process.env.NODE_ENV === 'test') {
    console.log('running test environment');
    mongoURI = 'mongodb://' + settings.dbuser + ':' + settings.dbpass + '@' + settings.host + '/' + 'test_' + settings.db;
  } else {
    mongoURI = 'mongodb://' + settings.dbuser + ':' + settings.dbpass + '@' + settings.host + '/' + settings.db;
  }
  mongoose.connect(mongoURI);
  mongoose.connection.on('connected', function() {
    console.log('Mongoose default connection open to ' + mongoURI);
  });

  // If the connection throws an error
  mongoose.connection.on('error', function(err) {
    console.log('Mongoose default connection error: ' + err);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', function() {
    console.log('Mongoose default connection disconnected');
  });

  var port = app.get('port');
  http.createServer(app).listen(process.env.PORT || port, function() {
    console.log('Express server listening on port ' + port);
  });
  // If the Node process ends, close the Mongoose connection 
  process.on('SIGINT', function() {
    mongoose.connection.close(function() {
      console.log('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });
};
