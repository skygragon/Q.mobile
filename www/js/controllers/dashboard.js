angular.module('Controllers', [])
.controller('DashboardController', function($scope, $rootScope, C3, DB, Stat) {

  $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {
      if (toState.name === 'tabs.dashboard' && Stat.ctx.dirty)
        $scope.refreshStat();
    });

  $scope.refreshStat = function() {
    Stat.refresh(function() {
      $scope.stat = Stat.data;
      $scope.$apply();
    });
  };

  $scope.update = function() {
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

      DB.updateQuestions(questions, function(e) {
        // BulkError if questions are duplicated.
        $scope.duplicated = e;
        $scope.last_updated = Date.now();
        $scope.refreshStat();
        $scope.$apply();
      });
      return $scope.duplicated;
    });
  };

  $scope.updating = false;
  $scope.stat = Stat.data;
  $scope.updated = Stat.updated;
  $scope.refreshStat();
});
