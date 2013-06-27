var app = angular.module('myApp', ['service', 'LocalStorageModule']);

app.config(function($interpolateProvider) { 
      $interpolateProvider.startSymbol('(('); 
      $interpolateProvider.endSymbol('))');
});


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
 