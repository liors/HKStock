var app = angular.module('myApp', ['service', 'LocalStorageModule']);

app.config(function($interpolateProvider) { 
      $interpolateProvider.startSymbol('(('); 
      $interpolateProvider.endSymbol('))');
});

function UserCtrl($scope, $filter, Product, localStorageService) {
  var json = localStorageService.get("Search_History");
  var products = JSON.parse(json);

  $scope.products = Product.query({'ids':products});
  console.log($scope.products);


  $scope.delete = function(product, idx) {
    $scope.products.splice(idx, 1);
    var json = localStorageService.get('Search_History');
    var storedIds = JSON.parse(json);
    var ids = $filter('filter')(storedIds, function(id) {
      return id != product.id;
    });
    localStorageService.add('Search_History', JSON.stringify(ids));
  }
}
 