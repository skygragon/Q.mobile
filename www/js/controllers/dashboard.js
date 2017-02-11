angular.module('Controllers', [])
.controller('DashboardController', function($scope, $rootScope,
      $cordovaNetwork, C3, DB, Stat, H) {

  $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {
      if (toState.name === 'tabs.dashboard' && Stat.questions.dirty)
        $scope.refreshCount();
    });

  $scope.refreshCount = function() {
    Stat.refresh()
        .then(function() {
          $scope.count = Stat.questions.count;
        });
  };

  $scope.update = function() {
    try {
      if (!$cordovaNetwork.isOnline()) {
        H.error('Update Failed!', 'No available networking connection?');
        return;
      }
      if (($cordovaNetwork.getNetwork() !== Connection.WIFI) && Stat.updated.wifiOnly) {
        H.error('Update Failed!',
            'You might need WiFi connection to update new questions from careercup.com.');
        return;
      };
    } catch(e) {
      // FIXME: hack web test where no cordova defined...
      console.log(e.message);
    }

    $scope.updating = true;
    $scope.duplicated = false;
    Stat.updated.questions = 0;
    Stat.updated.pages = 0;

    C3.update(function(questions) {
      if (!questions) {
        $scope.updating = false;
        return;
      }

      Stat.updated.questions += questions.length;
      Stat.updated.pages++;

      DB.updateQuestions(questions)
        .then(function(e) {
          // BulkError if any questions are duplicated.
          // Here we keep trying until all questions are duplicated
          $scope.duplicated = (e && e.failures.length === questions.length);
          $scope.last_updated = Date.now();
          $scope.refreshCount();
        });
      return $scope.duplicated;
    });
  };

  $scope.updating = false;
  $scope.count = Stat.questions.count;
  $scope.updated = Stat.updated;
  $scope.refreshCount();
});
