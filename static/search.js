var app = angular.module('myApp', ['service']);

app.config(function($interpolateProvider) { 
      $interpolateProvider.startSymbol('(('); 
      $interpolateProvider.endSymbol('))');
});


function SearchCtrl($scope, Product) {
	$scope.placeholder = "Search hobbyking.com"
	$scope.showSearchDivider = false;
	$scope.main = true;
	$scope.change = function() {
		if ($scope.searchTerm.length > 0) {
    		$scope.products = Product.query({'query':$scope.searchTerm});
    		$scope.showSearchDivider = true; 
    		$scope.main = false;   		
    	} else {
			$scope.showSearchDivider = false;
			$scope.main = false;
    	}
    	
  	};
}
 