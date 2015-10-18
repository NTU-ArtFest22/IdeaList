'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timeStamps = require('mongoose-timestamp');

var AdminUserSchema = new Schema({
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
module.exports = mongoose.model('AdminUser', AdminUserSchema);