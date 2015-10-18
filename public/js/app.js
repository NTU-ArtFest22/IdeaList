'use strict';
angular.module('app', ['ngRoute'], function($locationProvider) {
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
      $scope.addIdea = false;
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
      $scope.newIdea = function() {
        $scope.addIdea = !$scope.addIdea;
      };
    }
  ])
  .controller('modelController', [
    '$scope',
    '$http',
    '$location',
    function(
      $scope,
      $http,
      $location
    ) {
      var linkInfo = function() {
        $scope.waiting = true;
        if ($scope.form.link !== '') {
          $http.post('/api/link_info', {
              url: $scope.form.link
            })
            .success(function(data) {
              $scope.waiting = false;
              $scope.form.image = data.image;
              $scope.form.tags.push(data.tags);
            })
            .error(function(err) {
              console.log(err);
            });
        }
      };
      $scope.form = {
        link: '',
        tags: []
      };
      $scope.$watch('form.link', _.debounce(linkInfo, 150));
      $scope.submitForm = function() {
        var data = $scope.form;
        $http
          .post('/api/create_idea', data)
          .success(function() {

          });
      };
    }
  ]);