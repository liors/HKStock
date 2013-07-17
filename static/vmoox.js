var app = angular.module('vmoox', ['vmoox.controllers', 'vmoox.services', 'LocalStorageModule']);

app.config(function($interpolateProvider) {
      $interpolateProvider.startSymbol('((');
      $interpolateProvider.endSymbol('))');
});