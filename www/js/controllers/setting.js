angular.module('Controllers')
.controller('SettingController', function($scope, $cordovaFile, DB, Stat) {
  $scope.tags = Stat.tags;
  $scope.companies = ['Apple', 'Amazon', 'Facebook', 'Google', 'Microsoft'];
  $scope.counts = ['1', '2', '4', '8', '16', '24', '32'];

  var dir;
  try {
    dir = cordova.file.externalDataDirectory || cordova.file.dataDirectory;
  } catch (e) {
    console.log(e.message);
    dir = './'; // FIXME: hack web test where no cordova defined...
  }
  var name = 'c3.json';
  $scope.fullpath = dir + name;

  $scope.filter = Stat.filter;
  $scope.updated = Stat.updated;
  $scope.IOing = false;

  $scope.backup = function() {
    $scope.IOing = true;
    DB.getQuestions()
      .then(function(questions) {
        if (!questions) {
          alert('Failed to backup');
        } else {
          var msg = 'Backup ' + questions.length + ' questions: ';
          var data = JSON.stringify(questions);
          $cordovaFile.writeFile(dir, name, data, true)
            .then(
              function(ok) {
                alert(msg + 'ok');
                $scope.IOing = false;
              },
              function(e) {
                alert(msg + 'failed because ' + e.message);
                $scope.IOing = false;
              }
            );
        }
      });
  };

  $scope.restore = function() {
    if (!confirm('Restore from last backup?')) {
      return;
    }
    // TODO: add file selection dialog
    $scope.IOing = true;
    $cordovaFile.readAsText(dir, name)
      .then(
        function(text) {
          var questions = JSON.parse(text);
          DB.setQuestions(questions)
            .then(function(e) {
              if (e) {
                alert('Failed to restore because ' + e.message);
              } else {
                alert('Restore ' + questions.length + ' questions: ok');
                Stat.questions.dirty = true;
              }
              $scope.IOing = false;
            });
        },
        function(e) {
          alert('Failed to read file because ' + e.message);
          $scope.IOing = false;
        }
      );
  };
});
