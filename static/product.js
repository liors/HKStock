var app = angular.module('myApp', ['cgBusy', 'ajoslin.promise-tracker']);

app.config(function($interpolateProvider) { 
      $interpolateProvider.startSymbol('(('); 
      $interpolateProvider.endSymbol('))');
});

function ProductCtrl($scope, $http, $timeout) {
  $scope.product = {}  
  $scope.status = "info";
  $timeout(function() {
      $http.get('/productInfo/'+window.Product.id, { tracker: 'product' })
          .success(function(data) {
                $scope.product.price = data.price;
                $scope.product.stock = data.stock;
                if (data.stock <= 0) {
                  $scope.status = "error";
                }

          });
  }, 0);
}
 
