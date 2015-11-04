'use strict';
var auth = require('http-auth');
var settings = require('../settings');

exports.loginCheck = function(req, res, next) {
  if (!req.user) {
    req.flash('error', 'Access denied');
    return res.redirect('/');
  }
  next();
};

exports.apiLoginCheck = function(req, res, next) {
  if (!req.user) {
    return res.status(500).json({
      error: 'forbidden'
    });
  }
  next();
};

var adminAuth = auth.basic({
  realm: 'Admin'
}, function(username, password, callback) { // Custom authentication method.
  callback(username === settings.adminName && password === settings.adminPassword);
});

exports.adminPageCheck = auth.connect(adminAuth);