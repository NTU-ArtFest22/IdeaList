'use strict';

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