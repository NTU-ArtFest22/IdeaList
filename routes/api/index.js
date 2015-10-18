'use strict';
var express = require('express');
var extractor = require('unfluff');
var request = require('request');
Promise = require('bluebird');
Promise.promisifyAll(request);
var middleWare = require('../middle_ware');
var app = express();
var _ = require('lodash');
var Idea = require('../../models').Idea;

var linkInfo = function(req, res) {
  var url = req.body.url;
  return request
    .getAsync({
      uri: url
    })
    .spread(function(response, body) {
      if (response.statusCode === 200) {
        var data = extractor(body);
        return res.json(data);
      }
      return res.json('ENOTFOUND');
    })
    .error(function(err) {
      if (err.errno !== 'ENOTFOUND') {
        return res.status(500).json(err);
      }
      return res.json('ENOTFOUND');
    });
};
var getIdea = function(req, res) {
  var query = req.body;
  return Idea
    .findAsync(query)
    .then(function(data) {
      return Idea.populateAsync(data, {
        path: 'user',
        select: 'name'
      });
    })
    .then(function(data) {
      return res.json(data);
    })
    .error(function(err) {
      return res.status(500).json(err);
    });
};
var createIdea = function(req, res) {
  var data = _.clone(req.body);
  data.user = req.user._id;
  if (_.isEmpty(data.tags)) {
    data.tags = ['uncategorized'];
  }
  var idea = new Idea(data);
  return idea
    .saveAsync()
    .then(function(data) {
      return res.json(data);
    })
    .error(function(err) {
      return res.status(500).json(err);
    });
};
var updateIdea = function(req, res) {
  var ideaId = req.params.id;
  var data = _.pick(req.body, 'tags', 'content');
  data.lastUpdateBy = req.user._id;
  return Idea
    .findOneAndUpdateAsync({
      _id: ideaId
    }, data)
    .then(function(data) {
      return res.json(data);
    })
    .error(function(err) {
      return res.status(500).json(err);
    });
};
var deleteIdea = function(req, res) {
  var ideaId = req.params.id;
  var user = req.user._id;
  return Idea
    .findOneAndRemoveAsync({
      _id: ideaId,
      user: user
    })
    .then(function(data) {
      return res.json(data);
    })
    .error(function(err) {
      return res.status(500).json(err);
    });
};
app.post('/link_info', linkInfo);
app.post('/get_idea', getIdea);
app.use(middleWare.apiLoginCheck);
app.put('/update_idea/:id', updateIdea);
app.post('/create_idea', createIdea);
app.delete('/delete_idea/:id', deleteIdea);
app.use(function(req, res) {
  return res.status(400).json({
    error: 'API does not exist.'
  });
});
module.exports = app;