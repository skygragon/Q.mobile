angular.module('Controllers')
.controller('QuestionController', function($scope, $rootScope, $cordovaInAppBrowser, DB, Stat) {

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

  $scope.open = function(url) {
    var opts = {
      location: 'yes',
      toolbar: 'yes'
    };
    $cordovaInAppBrowser.open(url, '_blank', opts);
  };

  $scope.updating = false;
  $scope.tagging = false;
  $scope.tagged = false;
  $scope.errored = false;

  $scope.newTags = Stat.tags;
  $scope.retries = 0;

  if (!$scope.question)
    $scope.getQuestion();
});
