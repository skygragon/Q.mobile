angular.module('Controllers', [])
.controller('DashboardController', function($scope, C3, DB) {

  DB.countQuestions(function(count) {
    $scope.$apply(function() {
      $scope.stat.all = count;
      $scope.last_updated = Date.now();
      $scope.labels = ['1','2','3'];
      $scope.data = [[10,20,30]];
    });
  });

  $scope.update = function() {
    $scope.updating = true;
    C3.update(function(questions) {
      DB.updateQuestions(questions, function(e) {
        console.log(e);
        console.log(questions.length);
        $scope.$apply(function() {
          $scope.last_updated = Date.now();
          $scope.updating = false;
        });
      });
    });
  };

  $scope.updating = false;
  $scope.stat = {all: 0};
  $scope.series = ['count'];
})
.controller('QuestionController', function($scope, DB) {

  $scope.getQuestion = function(cond) {
    $scope.updating = true;

    if ($scope.tagged) {
      DB.updateQuestion($scope.question, function(updated) {
        // console.log('updated:', updated);
        // console.log($scope.question);
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
  $scope.newTags = ['Resolved', 'Later', 'Favorite'];

  if (!$scope.question)
    $scope.getQuestion();
});
