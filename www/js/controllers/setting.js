angular.module('Controllers')
.controller('SettingController', function($scope, $ionicLoading,
      $cordovaFile, DB, Stat) {
  $scope.IOing = false;
  $scope.algos = ['Random', 'Sequential'];
  $scope.companies = ['Apple', 'Amazon', 'Facebook', 'Google', 'Microsoft'];
  $scope.counts = ['1', '2', '4', '8', '16', '24', '32'];
  $scope.filters = [
    {name: 'All', status: '1', tag: '', company: ''},
    {name: 'UnResolved', status: '0', tag: '', company: ''}
  ];

  var LOADING = '<ion-spinner class="spinner-positive" icon="bubbles"></ion-spinner>';

  $scope.init = function() {
    var filedir = './'; // FIXME: hack web test where no cordova defined...
    try {
      filedir = cordova.file.externalDataDirectory || cordova.file.dataDirectory;
    } catch (e) {
      console.log(e.message);
    }
    $scope.filedir = filedir;
    $scope.filename = 'c3.json';
    $scope.filepath = filedir + $scope.filename;

    $scope.filter = Stat.filter;
    $scope.updated = Stat.updated;
    $scope.tags = Stat.tags;
    $scope.tags.forEach(function(tag) {
      $scope.filters.push({name: tag, status: '1', tag: tag, company: ''});
    });
  };

  $scope.setFilter = function(f) {
    _.extendOwn($scope.filter, _.omit(f, 'name'));
  };

  $scope.backup = function() {
    $scope.IOing = true;
    $ionicLoading.show({template: LOADING});

    DB.getQuestions()
      .then(function(questions) {
        if (!questions) {
          alert('Failed to backup');
        } else {
          var msg = 'Backup ' + questions.length + ' questions: ';
          var data = JSON.stringify(questions);
          $cordovaFile.writeFile($scope.filedir, $scope.filename, data, true)
            .then(
              function(ok) {
                alert(msg + 'ok');
                $ionicLoading.hide();
                $scope.IOing = false;
              },
              function(e) {
                alert(msg + 'failed because ' + e.message);
                $ionicLoading.hide();
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
    $ionicLoading.show({template: LOADING});

    $cordovaFile.readAsText($scope.filedir, $scope.filename)
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
              $ionicLoading.hide();
              $scope.IOing = false;
            });
        },
        function(e) {
          alert('Failed to read file because ' + e.message);
          $ionicLoading.hide();
          $scope.IOing = false;
        }
      );
  };

  $scope.init();
});
