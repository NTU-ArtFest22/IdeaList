'use strict';
angular.module('app', [
      'ngRoute',
      'ui.select2',
      'ephox.textboxio',
      'truncate'
    ],
    function($locationProvider) {
      $locationProvider.html5Mode(true);
    })
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/index.html',
        controller: 'ideaController'
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
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
      var query = $location.search();
      $scope.hover = 'init';
      $scope.setHover = function(data) {
        $scope.hover = data;
      };
      $scope.addIdea = false;
      $http.post('/api/get_idea', query)
        .success(function(data) {
          var max_length = 150;
          _.each(data, function(element) {
            element.time = moment(element.created_at).fromNow();
          });
          $scope.ideaList = _.clone(data);
        })
        .error(function(err) {
          console.log(err);
        });
      $scope.newIdea = function() {
        $scope.addIdea = !$scope.addIdea;
      };
    }
  ])
  .controller('modelController', [
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
              $scope.form.tags = angular.extend($scope.form.tags, data.tags);
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
          .success(function() {

          });
      };
    }
  ]);