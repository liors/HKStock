var app = angular.module('myApp', ['service', 'LocalStorageModule']);

app.config(function($interpolateProvider) { 
      $interpolateProvider.startSymbol('(('); 
      $interpolateProvider.endSymbol('))');
});

function UserCtrl($scope, $filter, $http, Product, localStorageService) {
  var json = localStorageService.get("Search_History");
  var products = JSON.parse(json);
  $scope.products = Product.query({'ids':products}, function(data) {
    for(var index in data) {  
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
 