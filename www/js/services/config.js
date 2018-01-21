angular.module('Services', [])
  .service('Config', [ function() {
    return {
      name: 'leetcode',
      version: '1.3.0'
    };
  }]);
