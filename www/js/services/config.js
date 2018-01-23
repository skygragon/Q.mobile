angular.module('Services', [])
  .service('Config', [ function() {
    return {
      name: 'lintcode',
      version: '1.3.0'
    };
  }]);
