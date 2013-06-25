angular.module('service', ['ngResource']).
    factory('Product', function($resource) {
      return $resource('/search/:query', {query:'@query'});
    });