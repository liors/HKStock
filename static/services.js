var services = angular.module('vmoox.services', ['ngResource']);

services.factory('Products', function($resource) {
      return $resource('/search/:query', {query:'@query'});
});

services.factory('Product', function($resource) {
      return $resource('/get/:id', {id:'@id'});
});