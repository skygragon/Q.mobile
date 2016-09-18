angular.module('Vendors', [])
.service('_', [ '$window', function($window) {
    return $window._;
  }
])
.service('Dexie', [ '$window', function($window) {
    return $window.Dexie;
  }
]);
