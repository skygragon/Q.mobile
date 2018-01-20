angular.module('Services')
  .service('Fetcher', [ 'Config', 'C3', 'LeetCode', 'LintCode',
    function(Config, C3, LeetCode, LintCode) {
      var fetcher;
      switch(Config.name) {
        case 'careercup': fetcher = C3;       break;
        case 'leetcode':  fetcher = LeetCode; break;
        case 'lintcode':  fetcher = LintCode; break;
      }
      fetcher.name = Config.name;
      fetcher.version = Config.version;
      return fetcher;
    }]);
