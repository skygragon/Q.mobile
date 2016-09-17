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
    C3.update(function(questions) {
      DB.updateQuestions(questions, function(e) {
        $scope.$apply(function() {
          $scope.last_updated = Date.now();
          $scope.updating = false;
          $scope.refreshStat();
        });
      });
    });
  };

  $scope.updating = false;
  $scope.stat = Stat.data;
  $scope.refreshStat();
})
.controller('QuestionController', function($scope, DB, Stat) {

  $scope.getQuestion = function(cond) {
    $scope.updating = true;

    if ($scope.tagged) {
      DB.updateQuestion($scope.question, function(updated) {
        // console.log('updated:', updated);
        // console.log($scope.question);
        Stat.ctx.dirty = true;
        $scope.tagged = false;
        $scope.getQuestion();
      });
      return;
    }

    DB.getQuestion(cond, function(question) {
      if (!question)
        return $scope.getQuestion(cond);

      $scope.$apply(function() {
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
  $scope.newTags = Stat.tags;

  if (!$scope.question)
    $scope.getQuestion();
});
