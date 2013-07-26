var services = angular.module('vmoox.services', ['ngResource']);

services.factory('Products', function($resource) {
    return $resource('/search/:query', {query:'@query'});
});

services.factory('Product', function($resource) {
    return $resource('/get/:id', {id:'@id'});
});

services.factory('User', function($resource) {
    return $resource('/user/:userId', {userId:'@userId'});
});

services.factory('SaveProducts', function($resource) {
    return $resource('/user/:userId/:products', {userId:'@userId', products:'@products'});
});

services.factory('SharedProperties', function($rootScope) {
    var user;
    return {
        getUser: function () {
            return user;
        },
        setUser: function(value) {
            user = value;
            $rootScope.$broadcast('userSet');
        }
    };
});