var CAREERCUP = {
  version:  '1.2.1',
  name:     'Q.careercup',
  type:     'careercup',
  website:  'careercup.com',
  filename: 'c3'
};

var LEETCODE = {
  version:  '1.2.1',
  name:     'Q.leetcode',
  type:     'leetcode',
  website:  'leetcode.com',
  filename: 'leetcode'
};

angular.module('Services', [])
.service('Config', [ function() {
  //return LEETCODE;
  return CAREERCUP;
}]);
