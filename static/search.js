var demoApp = angular.module('myApp', ['ngResource'], function($locationProvider) {
    $locationProvider.hashPrefix('');
});
demoApp.factory('Serv', function($http, $resource) {
    return {
        AutoComplete: function(request, response) {
            console.log('AutoComplete called:' + request.term);
            $http.get('/search/'+request.term).success(function(data, status, headers, config) {
                retArray = data.map(function(item) {
                    return {
                        label: item.description,
                        value: item.id
                    }
                });
                response(retArray);
            });          
        }
    }
});

function MainCtrl($scope, Serv) {
    $scope.selectedItem = {
        value: 0,
        label: ''
    };
    $scope.Wrapper = Serv;
}
demoApp.directive('myAutocomplete', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            minInputLength: '@minInput',
            remoteData: '&',
            placeholder: '@placeholder',
            restrictCombo: '@restrict',
            selectedItem: '=selectedItem'
        },
        template: '<div class="dropdown search" ' + 
        '     ng-class="{open: focused && _choices.length>0}">' + 
        '     <input type="text" ng-model="searchTerm" placeholder="{{placeholder}}" ' + 
        '         tabindex="1" accesskey="s" class="input-large search-query search" focused="focused"> ' + 
        '     <ul class="dropdown-menu"> ' + 
        '         <li ng-repeat="choice in _choices">' + 
        '          <a href="javascript:void(0);" ng-click="selectMe(choice)">{{choice.label}}</a></li>' + 
        '     </ul>' +         
        '</div>',
        controller: function($scope, $element, $attrs) {

            //console.log('inside controller');
            $scope.selectMe = function(choice) {
                $scope.selectedItem = choice;
                $scope.searchTerm = $scope.lastSearchTerm = choice.label;
            };
            $scope.UpdateSearch = function() {
                if ($scope.canRefresh()) {
                    $scope.searching = true;
                    $scope.lastSearchTerm = $scope.searchTerm;
                    try {
                        $scope.remoteData({
                            request: {
                                term: $scope.searchTerm
                            },
                            response: function(data) {
                                $scope._choices = data;
                                $scope.searching = false;
                            }
                        });
                    } catch (ex) {
                        console.log(ex.message);
                        $scope.searching = false;
                    }
                }
            }
            $scope.$watch('searchTerm', $scope.UpdateSearch);
            $scope.canRefresh = function() {
                return ($scope.searchTerm !== "") && ($scope.searchTerm !== $scope.lastSearchTerm) && ($scope.searching != true) && ($scope.searchTerm.length > 3);                
            };
            $scope.selectMe = function(choice) {
                window.location.href = "/product/"+choice.value;
            }
        },
        link: function(scope, iElement, iAttrs, controller) {
            scope._searchTerm = '';
            scope._lastSearchTerm = '';
            scope.searching = false;
            scope._choices = [];
            if (iAttrs.restrict == 'true') {
                var searchInput = angular.element(iElement.children()[0])
                searchInput.bind('blur', function() {
                    if (scope._choices.indexOf(scope.selectedItem) < 0) {
                        scope.selectedItem = null;
                        scope.searchTerm = '';
                    }
                });
            }        
        }
    };
});

demoApp.directive("focused", function($timeout) {
    return function(scope, element, attrs) {
        element[0].focus();
        element.bind('focus', function() {
            scope.$apply(attrs.focused + '=true');
        });
        element.bind('blur', function() {
            $timeout(function() {
                scope.$eval(attrs.focused + '=false');
            }, 200);
        });
        scope.$eval(attrs.focused + '=true')
    }
});