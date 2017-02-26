angular.module('Services')
.service('Fetcher', [ 'Config', 'C3' ,function(Config, C3) {
  var fetcher = C3;
  // TODO: support more sources like leetcode, lintcode
  return fetcher;
}]);
