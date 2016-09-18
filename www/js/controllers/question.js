angular.module('Controllers')
.controller('QuestionController', function($scope, $rootScope, $cordovaInAppBrowser, DB, Stat) {

  $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {
      if (toState.name === 'tabs.question' && !$scope.question)
        $scope.selectQuestion();
    });

  $scope.selectQuestion = function(filter) {
    $scope.updating = true;

    if ($scope.tagged) {
      DB.updateQuestion($scope.question, function(updated) {
        Stat.ctx.dirty = true;
        $scope.tagged = false;
        $scope.selectQuestion();
      });
      return;
    }

    DB.selectQuestion(filter || Stat.filter, function(question) {
      if (!question) {
        console.log('cannot find question with filter:', Stat.filter);
      }

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

  $scope.newTags = Stat.tags;

  if (!$scope.question)
    $scope.selectQuestion();
});
