var CAREERCUP = {
  version:  '1.2.2',
  name:     'Q.careercup',
  type:     'careercup',
  website:  'careercup.com',
  filename: 'c3'
};

var LEETCODE = {
  version:  '1.2.2',
  name:     'Q.leetcode',
  type:     'leetcode',
  website:  'leetcode.com',
  filename: 'leetcode'
};

var LINTCODE = {
  version:  '1.2.2',
  name:     'Q.lintcode',
  type:     'lintcode',
  website:  'lintcode.com',
  filename: 'lintcode'
};

angular.module('Services', [])
.service('Config', [ function() {
  return LINTCODE;
  //return LEETCODE;
  //return CAREERCUP;
}]);
