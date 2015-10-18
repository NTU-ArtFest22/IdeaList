'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timeStamps = require('mongoose-timestamp');

var UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
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

module.exports = mongoose.model('User', UserSchema);