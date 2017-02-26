var CAREERCUP = {
  version:  '1.2.1',
  name:     'Q.careercup',
  type:     'careercup',
  website:  'careercup.com',
  filename: 'c3'
};

angular.module('Services', [])
.service('Config', [ function() {
  return CAREERCUP;
}]);
