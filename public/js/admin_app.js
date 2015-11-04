'use strict';
angular.module('admin_app', [
    'ui.router',
    'ui.select2',
    'ephox.textboxio',
    'truncate',
    'wu.masonry'
  ])
  .filter('to_trusted', ['$sce', function($sce) {
    return function(text) {
      return $sce.trustAsHtml(text);
    };
  }]);