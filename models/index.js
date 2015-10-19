'use strict';

var adminUserModel = require('./admin_user');
var userModel = require('./user');
var ideaModel = require('./idea');
var tagModel = require('./tag');

exports.AdminUser = adminUserModel;
exports.Tag = tagModel;
exports.Idea = ideaModel;
exports.User = userModel;