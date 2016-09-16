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

});
