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
    $rootScope.back = function() {
      var prevUrl = history.length > 1 ? history.splice(-2)[0] : '/';
      $location.path(prevUrl);
    };
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
      $http.post('/api/get_idea', query)
        .success(function(data) {
          _.each(data, function(element) {
            element.time = moment(element.created_at).format('MMMM Do YYYY, h:mm:ss a');
          });
          $scope.ideaList = _.clone(data);
        })
        .error(function(err) {
          console.log(err);
        });
    }
  ]);