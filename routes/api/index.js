'use strict';

var express = require('express');

var middleWare = require('../middle_ware');

var sessionRoute = require('./session');

var app = express();

app.post('/login', sessionRoute.login);

app.use(middleWare.apiLoginCheck);

module.exports = app;