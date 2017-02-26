ConfigService = {
  version:  '1.2.1',
  name:     'Q.careercup',
  type:     'careercup',
  website:  'careercup.com',
  database: 'c3.db'
};

angular.module('Services', [])
.service('Config', [ function() {
  return ConfigService;
}]);
