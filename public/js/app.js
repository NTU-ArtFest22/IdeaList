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
      if (!_.isEmpty($stateParams.array)) {
        if (_.isArray($stateParams.array)) {
          $rootScope.tags = $stateParams.array;
        } else {
          $rootScope.tags.push($stateParams.array);
        }
      }
      $scope.hover = 'init';
      $scope.setHover = function(data) {
        $scope.hover = data;
      };
      $scope.addIdea = false;
      $scope.newIdea = function() {
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
      $rootScope.tags = [];
      $rootScope.select2Options = {
        'multiple': true,
        'simple_tags': false,
        'width': '100%',
        'tags': []
      };
      $http
        .get('/api/get_tag')
        .success(function(data) {
          $rootScope.select2Options.tags = data;
          $('#tagSearch.select2Input').select2($rootScope.select2Options);
          console.log($('#tagSearch.select2Input'))
        });
      var getIdea = function() {
        var query;
        if (_.isEmpty($rootScope.tags)) {
          query = null;
        } else {
          query = {
            $and: _.map($rootScope.tags, function(tag) {
              return {
                tags: {
                  $in: [tag]
                }
              }
            })
          }
        }
        if ($rootScope.change_url) {
          $location.path('/tags').search({
            tag: $rootScope.tags
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
      }
      $rootScope.$watch('tags', function() {
        $scope.tags = $rootScope.tags;
      });
      $scope.$watch('tags', _.debounce(getIdea, 150));
      $scope.newIdea = function() {
        $scope.addIdea = !$scope.addIdea;
      };
      $scope.pushTag = function(tag) {
        $rootScope.tags.push(tag);
        $rootScope.tags = _.uniq($rootScope.tags)
        $state.go('tags', {
          tag: $rootScope.tags
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
      console.log('singleIdeaController')
      $scope.idea_id = $stateParams.id;
      $scope.addIdea = false;
      $http.get('/api/get_one_idea/' + $scope.idea_id)
        .success(function(data) {
          data.time = moment(data.created_at).fromNow();
          $scope.idea = _.clone(data);
          $rootScope.change_url = false;
          $rootScope.tags = $scope.idea.tags;
        })
        .error(function(err) {
          console.log(err);
        });
      $scope.newIdea = function() {
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
        'simple_tags': true,
        'tags': [],
        'width': '100%'
      };
      $http
        .get('/api/get_tag')
        .success(function(data) {
          $scope.select2Options.tags = angular.extend($scope.select2Options.tags, data);
        });
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
        $http
          .post('/api/create_idea', data)
      };
    }
  ]);