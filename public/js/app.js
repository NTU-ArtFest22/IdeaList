'use strict';
angular.module('app', [
    'ui.router',
    'ui.select2',
    'ephox.textboxio',
    'truncate',
    'wu.masonry'
  ])
  .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'partials/index.html',
        controller: 'ideaController'
      })
      .state('tags', {
        url: '/tags?tag',
        templateUrl: 'partials/index.html',
        controller: 'ideaController'
      })
      .state('idea', {
        url: '/idea/:id',
        templateUrl: 'partials/idea.html',
        controller: 'singleIdeaController'
      });
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
  })
  .filter('to_trusted', ['$sce', function($sce) {
    return function(text) {
      return $sce.trustAsHtml(text);
    };
  }])
  .controller('ideaController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    function(
      $scope,
      $rootScope,
      $state,
      $stateParams
    ) {
      console.log('ideaController');
      if ($state.current.name === 'home') {
        $rootScope.tags = [];
      }
      var select2_tag = _.map($stateParams.tag, function(tag) {
        return {
          id: tag,
          text: tag
        };
      });
      if (!_.isEmpty($stateParams.tag)) {
        if (_.isArray($stateParams.tag)) {
          $rootScope.tags = select2_tag;
          $rootScope.tags = _.uniq($rootScope.tags);
        } else {
          var tag = $stateParams.tag;
          $rootScope.tags.push({
            id: tag,
            text: tag
          });
          $rootScope.tags = _.uniq($rootScope.tags);
        }
      }
      $scope.hover = 'init';
      $scope.setHover = function(data) {
        $scope.hover = data;
      };
      $scope.addIdea = false;
      $scope.newIdea = function() {
        ga('send', {
          hitType: 'event',
          eventCategory: 'newIdea',
          eventAction: 'newIdea',
          eventLabel: 'Someone try to post a new idea'
        });
        $scope.addIdea = !$scope.addIdea;
      };
    }
  ])
  .controller('mainController', [
    '$scope',
    '$rootScope',
    '$http',
    '$location',
    '$state',
    '$stateParams',
    function(
      $scope,
      $rootScope,
      $http,
      $location,
      $state,
      $stateParams
    ) {
      console.log('mainController');
      jQuery.ajaxSetup({
        cache: true
      });
      $rootScope.tags = [];
      $rootScope.select2Options = {
        'multiple': true,
        'simple_tags': false,
        'width': '100%',
        'ajax': { // instead of writing the function to execute the request we use Select2's convenient helper
          url: '/api/get_tag',
          dataType: 'json',
          results: function(data, page) {
            return {
              results: data
            };
          }
        },
      };
      var getIdea = function() {
        var query;
        var tag_name_array = [];
        if (_.isEmpty($rootScope.tags)) {
          query = null;
        } else {
          query = {
            $and: _.map($rootScope.tags, function(tag) {
              var tag_name = tag;
              if (tag_name.text) {
                tag_name = tag_name.text;
                tag_name_array.push(tag_name);
                tag_name_array = _.uniq(tag_name_array);
              }
              return {
                tags: {
                  $in: [tag_name]
                }
              };
            })
          };
        }
        if ($rootScope.change_url) {
          $location.path('/tags').search({
            tag: tag_name_array
          });
        }
        $rootScope.change_url = true;
        $http.post('/api/get_idea', query)
          .success(function(data) {
            _.each(data, function(element) {
              element.time = moment(element.created_at).fromNow();
            });
            $rootScope.ideaList = _.clone(data);
          })
          .error(function(err) {
            console.log(err);
          });
      };
      $scope.$watch('tags', _.debounce(getIdea, 150));
      $scope.newIdea = function() {
        ga('send', {
          hitType: 'event',
          eventCategory: 'newIdea',
          eventAction: 'newIdea',
          eventLabel: 'Someone try to post a new idea'
        });
        $scope.addIdea = !$scope.addIdea;
      };
      $scope.pushTag = function(tag) {
        $rootScope.tags.push({
          id: tag,
          text: tag
        });
        $rootScope.tags = _.uniq($rootScope.tags);
        $rootScope.link_params = _.map($rootScope.tags, function(tag) {
          return tag.text;
        });
        $state.go('tags', {
          tag: $rootScope.link_params
        });
      };
    }
  ])
  .controller('singleIdeaController', [
    '$scope',
    '$rootScope',
    '$http',
    '$stateParams',
    function(
      $scope,
      $rootScope,
      $http,
      $stateParams
    ) {
      console.log('singleIdeaController');
      $scope.idea_id = $stateParams.id;
      $scope.addIdea = false;
      $http.get('/api/get_one_idea/' + $scope.idea_id)
        .success(function(data) {
          data.time = moment(data.created_at).fromNow();
          $scope.idea = _.clone(data);
          $rootScope.change_url = false;
          $rootScope.tags = _.map($scope.idea.tags, function(tag) {
            return {
              id: tag,
              text: tag
            };
          });
        })
        .error(function(err) {
          console.log(err);
        });
      $scope.newIdea = function() {
        ga('send', {
          hitType: 'event',
          eventCategory: 'newIdea',
          eventAction: 'newIdea',
          eventLabel: 'Someone try to post a new idea'
        });
        $scope.addIdea = !$scope.addIdea;
      };
    }
  ])
  .controller('modalController', [
    '$scope',
    '$http',
    function(
      $scope,
      $http
    ) {
      $scope.waiting = false;
      $scope.select2Options = {
        'multiple': true,
        'simple_tags': false,
        'tags': [],
        'width': '100%'
      };
      $scope.loading = false;
      $http
        .get('/api/get_tag')
        .success(function(data) {
          $scope.select2Options.tags = angular.extend($scope.select2Options.tags, data);
        });
      var linkInfo = function() {
        if ($scope.form.link !== '') {
          $scope.waiting = true;
          $http
            .post('/api/link_info', {
              url: $scope.form.link
            })
            .success(function(data) {
              $scope.waiting = false;
              $scope.form.image = data.image;
              if (data.keywords) {
                var keywords = data.keywords.split(',');
              }
              $scope.form.tags = angular.extend($scope.form.tags, _.map(data.tags, function(tag) {
                return {
                  id: tag,
                  text: tag
                };
              }));
              $scope.form.tags = angular.extend($scope.form.tags, keywords);
              $scope.form.tags = angular.extend($scope.form.tags, _.map(keywords, function(tag) {
                return {
                  id: tag,
                  text: tag
                };
              }));
              $scope.form.linkTitle = data.title;
            })
            .error(function(err) {
              console.log(err);
            });
        }
      };
      $scope.form = {
        link: '',
        contentRequired: true,
        tags: []
      };
      $scope.$watch('form.link', _.debounce(linkInfo, 150));
      $scope.submitForm = function() {
        ga('send', {
          hitType: 'event',
          eventCategory: 'ideaSubmit',
          eventAction: 'ideaSubmit',
          eventLabel: 'Someone submited an idea'
        });
        var data = $scope.form;
        if (data.link && data.tags !== []) {
          $scope.loading = true;
          $http
            .post('/api/create_idea', data)
            .success(function() {
              $scope.loading = false;
            });
        }
      };
    }
  ]);