angular.module('Services')
.service('Fetcher', [ 'Config', 'C3', 'LeetCode',
    function(Config, C3, LeetCode) {
  var fetcher;
  switch(Config.type) {
    case 'careercup': fetcher = C3;       break;
    case 'leetcode':  fetcher = LeetCode; break;
  }

  // TODO: support more sources like lintcode
  return fetcher;
}]);
