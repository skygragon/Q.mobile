angular.module('Controllers')
.controller('SettingController', function($scope, DB, Stat) {
  $scope.tags = Stat.tags;
  $scope.companies = ['Apple', 'Amazon', 'Facebook', 'Google', 'Microsoft'];

  $scope.filter = Stat.filter;
  $scope.updated = Stat.updated;
});
