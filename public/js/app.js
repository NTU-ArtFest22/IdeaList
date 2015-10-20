'use strict';
angular.module('app', [
    'ui.router',
    'ui.select2',
    'ephox.textboxio',
    'truncate'
  ])
  .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
      .state('home', {
        url: '/',
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
  .run(function($rootScope, $location) {
    var history = [];
    $rootScope.$on('$routeChangeSuccess', function() {
      history.push($location.$$path);
    });
  })
  .filter('to_trusted', ['$sce', function($sce) {
    return function(text) {
      return $sce.trustAsHtml(text);
    };
  }])
  .controller('ideaController', [
    '$scope',
    '$http',
    '$location',
    function(
      $scope,
      $http,
      $location
    ) {
      $scope.tags = [];
      $scope.hover = 'init';
      $scope.setHover = function(data) {
        $scope.hover = data;
      };
      $scope.addIdea = false;
      var getIdea = function() {
        var query;
        if (_.isEmpty($scope.tags)) {
          query = null;
        } else {
          query = {
            $and: _.map($scope.tags, function(tag) {
              return {
                tags: {
                  $in: [tag]
                }
              }
            })
          }
        }
        $http.post('/api/get_idea', query)
          .success(function(data) {
            _.each(data, function(element) {
              element.time = moment(element.created_at).fromNow();
            });
            $scope.ideaList = _.clone(data);
          })
          .error(function(err) {
            console.log(err);
          });
      }
      getIdea();
      $scope.$watch('tags', _.debounce(getIdea, 150));
      $scope.newIdea = function() {
        $scope.addIdea = !$scope.addIdea;
      };
      $scope.pushTag = function(tag) {
        $scope.tags.push(tag);
        $scope.tags = _.uniq($scope.tags)
      };
      $scope.initModal = function(idea) {
        $scope.ideaModal = _.clone(idea);
        $('#popoverIdea').modal();
      }
    }
  ])
  .controller('singleIdeaController', [
    '$scope',
    '$http',
    '$stateParams',
    function(
      $scope,
      $http,
      $stateParams
    ) {
      $scope.idea_id = $stateParams.id;
      $scope.addIdea = false;
      $http.get('/api/get_one_idea/' + $scope.idea_id)
        .success(function(data) {
          data.time = moment(data.created_at).fromNow();
          $scope.idea = _.clone(data);
        })
        .error(function(err) {
          console.log(err);
        });
      $scope.newIdea = function() {
        $scope.addIdea = !$scope.addIdea;
      };
      $scope.initModal = function(idea) {
        $scope.ideaModal = _.clone(idea);
        $('#popoverIdea').modal();
      }
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
      $http
        .get('/api/get_tag')
        .success(function(data) {
          $scope.select2Options.tags = angular.extend($scope.select2Options.tags, data);
        });
      $scope.select2Options = {
        'multiple': true,
        'simple_tags': true,
        'tags': []
      };
      var linkInfo = function() {
        if ($scope.form.link !== '') {
          $scope.waiting = true;
          $http.post('/api/link_info', {
              url: $scope.form.link
            })
            .success(function(data) {
              $scope.waiting = false;
              $scope.form.image = data.image;
              if (data.keywords) {
                var keywords = data.keywords.split(', ');
              }
              $scope.form.tags = angular.extend($scope.form.tags, data.tags);
              $scope.form.tags = angular.extend($scope.form.tags, keywords);
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
        var data = $scope.form;
        console.log(data);
        $http
          .post('/api/create_idea', data)
          .success(function() {});
      };
    }
  ]);