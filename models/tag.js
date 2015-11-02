'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timeStamps = require('mongoose-timestamp');

var TagSchema = new Schema({
  name: {
    type: String,
    default: ''
  }
});
TagSchema.plugin(timeStamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = mongoose.model('Tag', TagSchema);