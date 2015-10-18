'use strict';

var api = require('./api');
var _ = require('lodash');
var middleWare = require('./middle_ware');

function passLocals(req, pageTitle, object) {
  var error = req.flash('error');
  var message = req.flash('message');
  var currentUser = req.session.currentUser;
  return _.extend({
    error: error,
    message: message,
    currentUser: currentUser,
    pageTitle: pageTitle
  }, object);
}

module.exports = function(app) {

  app.use('/api', api);
  /*----- index page -----*/

  app.get('/redirect', function(req, res) {
    var msgType = req.query.msgType || '';
    var messageAvaiable = {
      '': '',
      'loginRequired': 'You have to login first!'
    };
    var message = messageAvaiable[msgType];
    var redirectUrl = req.query.redirectUrl;
    var error = req.flash('error').toString();
    return res.render('redirect',
      passLocals(req, 'redirect', {
        message: message,
        error: error,
        redirectUrl: redirectUrl
      }));
  });

  app.get('/', function(req, res) {
    return res.render('index', passLocals(req, 'index'));
  });
  app.get('/login', function(req, res) {
    return res.render('login', passLocals(req, 'login'));
  });

  app.use(middleWare.loginCheck);

  app.use(function(req, res) {
    req.flash('error', '404 Page Not Found');
    return res.redirect('/redirect');
  });
};