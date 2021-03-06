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
var Tag = require('../../models').Tag;

var config = require('../../settings');

var Slackbot = require('slackbot');
var slackbot = new Slackbot(config.slackTeam, config.slackKey);
Promise.promisifyAll(slackbot);

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
      console.log(err);
      if (err.errno !== 'ENOTFOUND') {
        return res.status(500).json(err);
      }
      return res.json('ENOTFOUND');
    });
};
var getOneIdea = function(req, res) {
  var query = {
    _id: req.params.id
  };
  return Idea
    .findOneAsync(query)
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
      console.log(err.stack);
      return res.status(500).json(err);
    });
};
var getIdea = function(req, res) {
  var query = req.body;
  if (query && query.tags && _.isEmpty(query.tags.$in)) {
    delete query.tags;
  }
  return Idea
    .findAsync({
      $query: query,
      $orderby: {
        created_at: -1
      }
    })
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
      console.log(err.stack);
      return res.status(500).json(err);
    });
};
var getTag = function(req, res) {
  return Tag
    .findAsync()
    .then(function(data) {
      data = _.map(data, function(element) {
        return {
          id: element._id,
          text: element.name
        };
      });
      return res.json(data);
    })
    .error(function(err) {
      console.log(err.stack);
      return res.status(500).json(err);
    });
};
var getComment = function(req, res) {
  var query = {
    _id: req.params.id
  };
  return Idea
    .findAsync(query)
    .then(function(data) {
      var idea = data[0];
      var message = '```New comment on ' +
        idea.linkTitle + '\n' +
        'Check it out at: ' + 'http://ntuaf-idea-pool.herokuapp.com/' + 'idea/' + idea._id + '\n' +
        '```';
      return slackbot.sendAsync('#ideas', message);
    })
    .then(function(data) {
      return res.json({
        msg: 'ok'
      });
    })
    .error(function(err) {
      console.log(err.stack);
      return res.status(500).json(err);
    });
};
var createIdea = function(req, res) {
  var data = _.clone(req.body);
  data.user = req.user._id;
  if (_.isEmpty(data.tags)) {
    data.tags = [{
      text: 'uncategorized'
    }];
  }
  var promiseArray = [];
  var tags = [];
  _.each(data.tags, function(tag) {
    tags.push(tag.text);
    return Tag
      .findOneAsync({
        name: tag.text
      })
      .then(function(data) {
        if (!data) {
          var newTag = new Tag({
            name: tag.text
          });
          return newTag.saveAsync();
        }
      });
  });
  data.tags = tags;
  var idea = new Idea(data);
  var ideaJson;
  return Promise
    .settle(promiseArray)
    .then(function() {
      return idea.saveAsync();
    })
    .then(function(data) {
      ideaJson = data;
      return Idea.populateAsync(data, {
        path: 'user',
        select: 'name'
      });
    })
    .then(function(data) {
      var idea = data[0];
      var message = '```' + 'A new idea is added by ' + idea.user.name + '\n' +
        idea.linkTitle + '\n' +
        'Check it out at: ' + 'http://ntuaf-idea-pool.herokuapp.com/' + 'idea/' + idea._id + '\n' +
        '```';
      return slackbot.sendAsync('#ideas', message);
    })
    .then(function(data) {
      return res.json(ideaJson);
    })
    .error(function(err) {
      console.log(err.stack);
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
      console.log(err.stack);
      return res.status(500).json(err);
    });
};
app.get('/get_tag', getTag);
app.get('/get_one_idea/:id', getOneIdea);
app.post('/get_comment/:id', getComment);
app.post('/link_info', linkInfo);
app.post('/get_idea', getIdea);
app.use(middleWare.apiLoginCheck);
app.put('/update_idea/:id', updateIdea);
app.post('/create_idea', createIdea);

app.use(function(req, res) {
  return res.status(400).json({
    error: 'API does not exist.'
  });
});
module.exports = app;