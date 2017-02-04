angular.module('App', ['ionic', 'ngCordova', 'Controllers', 'Services'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('tabs', {
      url: '/tabs',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })
    .state('tabs.dashboard', {
      url: '/dashboard',
      views: {
        'tabs-dashboard': {
          templateUrl: 'templates/tabs-dashboard.html',
          controller: 'DashboardController'
        }
      }
    })
    .state('tabs.question', {
      url: '/question',
      views: {
        'tabs-question': {
          templateUrl: 'templates/tabs-question.html',
          controller: 'QuestionController'
        }
      }
    })
    .state('tabs.setting', {
      url: '/setting',
      views: {
        'tabs-setting': {
          templateUrl: 'templates/tabs-setting.html',
          controller: 'SettingController'
        }
      }
    });

  $urlRouterProvider.otherwise('/tabs/dashboard');
});
