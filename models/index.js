'use strict';

var adminUserModel = require('./admin_user');
var userModel = require('./user');
var ideaModel = require('./idea');

exports.AdminUser = adminUserModel;
exports.Idea = ideaModel;
exports.User = userModel;