angular.module('vmoox.controllers', ['facebook', 'cgBusy', 'ajoslin.promise-tracker', 'angular-underscore']);

function SearchCtrl($scope, $window, Products, localStorageService) {
    $scope.placeholder = "Search hobbyking.com"
    $scope.showSearchDivider = false;
    $scope.main = true;
    $scope.change = function() {
        if ($scope.searchTerm.length > 0) {
            $scope.products = Products.query({'query':$scope.searchTerm});
            $scope.showSearchDivider = true;
            $scope.main = false;
        } else {
            $scope.showSearchDivider = false;
            $scope.main = false;
        }

    };
    $scope.go = function(obj) {
        var json = localStorageService.get('Search_History');
        var storedIds = [];
        if (json !== null) {
            storedIds = JSON.parse(json);
        }
        storedIds.push(obj.id);
        localStorageService.add('Search_History', JSON.stringify(storedIds));
        $window.location = '/product/' + obj.id;
    }
}

function ProductCtrl($scope, $http, $timeout, localStorageService) {
    $scope.product = {}
    $scope.status = "info";
    $timeout(function() {
        $http.get('/productInfo/' + window.Product.id, { tracker: 'product' })
            .success(function(data) {
                $scope.product.price = data.price;
                $scope.product.stock = data.stock;
                $scope.product.id = window.Product.id;
                if (data.stock <= 0) {
                    $scope.status = "error";
                }

            });
    }, 0);
    $scope.add = function(obj) {
        var json = localStorageService.get('Search_History');
        var storedIds = [];
        if (json !== null) {
            storedIds = JSON.parse(json);
        }
        storedIds.push(obj.id);
        localStorageService.add('Search_History', JSON.stringify(storedIds));    }

}

function UserCtrl($scope, $filter, $http, Product, localStorageService, Facebook) {
    var json = localStorageService.get("Search_History");
    var products = JSON.parse(json);
    products = _.compact(products) + "";
    $scope.products = Product.query({'ids':products}, function(data) {
        for (var index in data) {
            $scope.products[index].price = "Getting latest price...";
            $scope.products[index].stock = "Getting latest stock level...";
            getProductData(index, data[index].id)
        }
    });

    $scope.delete = function(product, idx) {
        $scope.products.splice(idx, 1);
        var json = localStorageService.get('Search_History');
        var storedIds = JSON.parse(json);
        var ids = $filter('filter')(storedIds, function(id) {
            return id != product.id;
        });
        localStorageService.add('Search_History', JSON.stringify(ids));
    }

    var promise = Facebook.getUser();
    promise.then(function(user) {
        $scope.user = user;
    }, function(reason) {
        alert('Failed: ' + reason);
    });

    function getProductData(index, id) {
        $http.get('/productInfo/' + id)
            .success(function(data) {
                $scope.products[index].price = data.price;
                $scope.products[index].stock = data.stock;
                if (data.stock <= 0) {
                    $scope.products[index].status = "error";
                }
            });
    }
}

function NavCtrl($scope, Facebook) {
    var promise = Facebook.getUser();
    promise.then(function(user) {
        $scope.user = user;
    }, function(reason) {
        alert('Failed: ' + reason);
    });

    $scope.logIn = function() {
        FB.login(function() {
        }, { perms: 'email' });
    }
}

