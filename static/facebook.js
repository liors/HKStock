var services = angular.module('facebook', []);

services.factory('Facebook', function($q, $rootScope) {

    // resolving or rejecting a promise from a third-party
    // API such as Facebook must be
    // performed within $apply so that watchers get
    // notified of the change
    resolve = function(errval, retval, deferred) {
        $rootScope.$apply(function() {
            if (errval) {
                deferred.reject(errval);
            } else {
                retval.connected = true;
                retval.gravatar = 'http://www.gravatar.com/avatar/' + md5(retval.email) + '?s=30';
                deferred.resolve(retval);
            }
        });
    }

    return {
        getUser: function() {
            if (FB === undefined) return;
            var deferred = $q.defer();
            FB.getLoginStatus(function(response) {
                if (response.status == 'connected') {
                    FB.api('/me', function(response) {
                        resolve(null, response, deferred);
                    });
                } else if (response.status == 'not_authorized') {
                    FB.login(function(response) {
                        if (response.authResponse) {
                            FB.api('/me', function(response) {
                                resolve(null, response, deferred);
                            });
                        } else {
                            resolve(response.error, null, deferred);
                        }
                    });
                }
            });
            promise = deferred.promise;
            promise.connected = true;
            return promise;
        }
    };
});

