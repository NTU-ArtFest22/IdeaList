'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timeStamps = require('mongoose-timestamp');

var _ = require('lodash');

var UserSchema = new Schema({
  facebook: {
    id: String,
    email: String,
    name: String
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  photo: {
    type: String,
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
UserSchema.plugin(timeStamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

UserSchema.statics.findOrCreateOAuthUser = function(profile, done) {
  var User = this;
  // Build dynamic key query
  var query = {};
  query[profile.authOrigin + '.id'] = profile.id;
  return User
    .findOneAsync(query)
    .then(function(user) {
      if (user) {
        return new Promise(function(resolve, reject) {
          return resolve(user);
        });
      }
      return User
        .findOneAsync({
          'email': profile.emails[0].value
        });
    })
    .then(function(user) {
      if (user) {
        // Preexistent e-mail, update
        user['' + profile.authOrigin] = {};
        user['' + profile.authOrigin].id = profile.id;
        user['' + profile.authOrigin].email = profile.emails[0].value;
        user['' + profile.authOrigin].photo = profile.photos[0].value;
        user['' + profile.authOrigin].name = profile.displayName;
        user.lastLogin = new Date();
        var userSave = user.saveAsync();
        return userSave;
      }
      user = {
        photo: profile.photos[0].value, 
        name: profile.displayName,
        email: profile.emails[0].value,
        firstName: profile.displayName.split(' ')[0],
        lastName: profile.displayName.replace(profile.displayName.split(' ')[0] + ' ', '')
      };

      user['' + profile.authOrigin] = {};
      user['' + profile.authOrigin].id = profile.id;
      user['' + profile.authOrigin].email = profile.emails[0].value;
      user['' + profile.authOrigin].photo = profile.photos[0].value;
      user['' + profile.authOrigin].name = profile.displayName;
      return User.create(user);
    })
    .then(function(user) {
      if(_.isArray(user)){
        user = user[0];
      }
      return done(null, user);
    })
    .error(function(err) {
      console.log(err);
      return done(err, null);
    });
};


module.exports = mongoose.model('User', UserSchema);