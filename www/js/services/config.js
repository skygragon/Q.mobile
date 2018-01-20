angular.module('Services', [])
  .service('Config', [ function() {
    return {
      name: 'careercup',
      version: '1.3.0'
    };
  }]);
