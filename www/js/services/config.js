var CAREERCUP = {
  version:  '1.3.0',
  name:     'careercup'
};

var LEETCODE = {
  version:  '1.3.1',
  name:     'leetcode'
};

var LINTCODE = {
  version:  '1.3.0',
  name:     'lintcode'
};

angular.module('Services', [])
.service('Config', [ function() {
  //return LINTCODE;
  //return LEETCODE;
  return CAREERCUP;
}]);
