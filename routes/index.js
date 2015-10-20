'use strict';

var api = require('./api');
var _ = require('lodash');
var passport = require('passport');

var middleWare = require('./middle_ware');

function passLocals(req, pageTitle, object) {
  var error = req.flash('error');
  var message = req.flash('message');
  return _.extend({
    defaultImage: 'placeholder.png',
    error: error,
    message: message,
    pageTitle: pageTitle
  }, object);
}

module.exports = function(app) {

  app.use('/api', api);
  /*----- index page -----*/
  app.get('/', function(req, res) {
    return res.render('index', passLocals(req, 'index', {
      user: req.user
    }));
  });

  app.post('/admin_login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/admin_login',
  }));

  app.get('/login/facebook', passport.authenticate('facebook', {
    scope: 'email',
  }));

  app.get('/login/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/'
    }),
    function(req, res) {
      return res.redirect('/');
    }
  );

  app.get('/admin_login', function(req, res) {
    return res.render('login', passLocals(req, 'login'));
  });

  app.use(middleWare.loginCheck);

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
  app.get('*', function(req, res) {
    return res.render('index', passLocals(req, 'index', {
      user: req.user
    }));
  });
};