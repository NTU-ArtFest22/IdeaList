'use strict';

var api = require('./api');
var _ = require('lodash');
var passport = require('passport');

var settings = require('../settings');

var middleWare = require('./middle_ware');

var adminUrl = '/' + settings.adminUrl;

var Idea = require('../models').Idea;
var Tag = require('../models').Tag;

function passLocals(req, pageTitle, object) {
  var error = req.flash('error');
  var message = req.flash('message');
  return _.extend({
    defaultImage: 'logo.png',
    error: error,
    message: message,
    pageTitle: pageTitle
  }, object);
}

var deleteIdea = function(req, res) {
  var ideaId = req.params.id;
  return Idea
    .findOneAndRemoveAsync({
      _id: ideaId,
    })
    .then(function(data) {
      return res.redirect(adminUrl);
    })
    .error(function(err) {
      console.log(err.stack);
      return res.redirect(adminUrl);
    });
};

module.exports = function(app) {

  app.use('/api', api);
  /*----- index page -----*/
  app.get('/', function(req, res) {
    return res.render('index', passLocals(req, 'index', {
      user: req.user
    }));
  });

  app.get('/delete_idea/:id',middleWare.adminPageCheck, deleteIdea);
  app.get(adminUrl, middleWare.adminPageCheck, function(req, res) {
    return Idea
      .findAsync({
        $query: {},
        $orderby: {
          created_at: -1
        }
      })
      .then(function(data) {
        return Idea.populateAsync(data, {
          path: 'user',
          select: 'name'
        });
      })
      .then(function(data) {
        return res.render('admin', {
          ideas: data
        });
      })
      .error(function(err) {
        console.log(err.stack);
        return res.redirect(adminUrl);
      });
  });

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