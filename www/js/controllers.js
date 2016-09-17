angular.module('Controllers', [])
.controller('DashboardController', function($scope, $rootScope, C3, DB, Stat) {

  $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {
      if (toState.name === 'tabs.dashboard' && Stat.ctx.dirty)
        $scope.refreshStat();
    });

  $scope.refreshStat = function() {
    Stat.refresh(function() {
      $scope.$apply(function() {
        $scope.stat = Stat.data;
      });
    });
  };

  $scope.update = function() {
    $scope.updating = true;
    $scope.duplicated = false;

    C3.update(function(questions) {
      DB.updateQuestions(questions, function(e) {
        // BulkError if questions are duplicated.
        $scope.duplicated = e;

        $scope.$apply(function() {
          $scope.last_updated = Date.now();
          $scope.updating = false;
          $scope.refreshStat();
        });
      });
      return $scope.duplicated;
    });
  };

  $scope.updating = false;
  $scope.stat = Stat.data;
  $scope.refreshStat();
})
.controller('QuestionController', function($scope, $rootScope, DB, Stat) {

  $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {
      if (toState.name === 'tabs.question' && !$scope.question)
        $scope.getQuestion();
    });

  $scope.getQuestion = function(filter) {
    $scope.updating = true;

    if ($scope.tagged) {
      DB.updateQuestion($scope.question, function(updated) {
        Stat.ctx.dirty = true;
        $scope.tagged = false;
        $scope.getQuestion();
      });
      return;
    }

    DB.getQuestion(filter || Stat.filter, function(question) {
      var errored = false;

      if (!question) {
        console.log('cannot find question with filter:', Stat.filter);
        if (++$scope.retries > 10) {
          // too many times, maybe there is no such question??
          errored = true;
        } else {
          return $scope.getQuestion(filter);
        }
      }

      $scope.$apply(function() {
        $scope.errored = errored;
        $scope.retries = 0;
        $scope.tagged = false;
        $scope.question = question;
        $scope.updating = false;
      });
    });
  };

  $scope.addTag = function(tag) {
    var question = $scope.question;
    if (question.tags.indexOf(tag) >= 0) return;

    question.tags.push(tag);
    question.status = (question.tags.indexOf('Resolved') >= 0) ? 1 : 0;
    $scope.question = question;
    $scope.tagged = true;
  };

  $scope.removeTag = function(tag) {
    var question = $scope.question;
    var i = question.tags.indexOf(tag);
    if (i < 0) return;

    question.tags.splice(i, 1);
    question.status = (question.tags.indexOf('Resolved') >= 0) ? 1 : 0;
    $scope.question = question;
    $scope.tagged = true;
  };

  $scope.updating = false;
  $scope.tagging = false;
  $scope.tagged = false;
  $scope.errored = false;

  $scope.newTags = Stat.tags;
  $scope.retries = 0;

  if (!$scope.question)
    $scope.getQuestion();
})
.controller('SettingController', function($scope, DB, Stat) {
  $scope.tags = Stat.tags;
  $scope.companies = ['Apple', 'Amazon', 'Facebook', 'Google', 'Microsoft'];

  $scope.filter = Stat.filter;
  $scope.update = Stat.update;
});
