'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timeStamps = require('mongoose-timestamp');

var Promise = require('bluebird');
var hash = require('../utility/hash');
Promise.promisifyAll(hash);

var AdminUserSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  salt: {
    type: String
  },
  hash: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    default: 'Normal'
  },
  firstLogin: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});
AdminUserSchema.plugin(timeStamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

AdminUserSchema.statics.isValidUserPassword = function(email, password, done) {
  return this
    .findOneAsync({
      email: email
    })
    .then(function(user) {
      if (!user) {
        return done(null, false, {
          message: 'Incorrect email.'
        });
      }
      return hash
        .hashAsync(password, user.salt).then(function(hash) {
          if (hash === user.hash) {
            return done(null, user);
          }
          done(null, false, {
            message: 'Incorrect password'
          });
        })
        .error(function(err) {
          return done(err, null);
        });
    })
    .error(function(err) {
      return done(err);
    });
};

module.exports = mongoose.model('AdminUser', AdminUserSchema);