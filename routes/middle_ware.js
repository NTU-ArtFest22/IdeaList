'use strict';

exports.loginCheck = function(req, res, next) {
  if (!req.session.currentUser) {
    req.flash('error', 'Access denied');
    return res.redirect('/redirect');
  }
  next();
};

exports.apiLoginCheck = function(req, res, next) {
  if (!req.session.currentUser) {
    return res.status(500).json({
      error: 'forbidden'
    });
  }
  next();
};