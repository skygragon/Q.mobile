angular.module('Controllers')
.controller('SettingController', function($scope, FS, DB, Stat, H, Config) {
  $scope.IOing = false;
  $scope.algos = ['Random', 'Sequential'];
  $scope.companies = ['Apple', 'Amazon', 'Facebook', 'Google', 'Microsoft'];
  $scope.counts = ['1', '2', '4', '8', '16'];
  $scope.filters = [
    {name: 'All', status: '1', tag: '', company: ''},
    {name: 'UnResolved', status: '0', tag: '', company: ''}
  ];
  $scope.Config = Config;
  $scope.FS = FS;

  $scope.init = function() {
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

  function prettyNumber(n) {
    return '<span class="text-big stable">' + n + '</span>';
  }

  $scope.backup = function() {
    $scope.IOing = true;
    H.loading('Preparing questions');

    DB.getQuestions()
      .then(function(questions) {
        if (!questions)
          return H.error('Backup Failed!', 'No questions found?');

        var n = prettyNumber(questions.length);
        H.loading('<br/>Backuping ' + n + ' questions');

        FS.save(questions, function(e, filepath) {
          H.loading();
          if (e) {
            H.error('Backup Failed!', e.message);
          } else {
            H.ok('Backup Succeed!', '<br/>Backuped ' + n + ' questions');
          }
          $scope.IOing = false;
        });
      });
  };

  $scope.restore = function() {
    H.yesOrNo(null, 'Are you sure to restore from last backup?')
      .then(function(yes) {
        if (!yes) return;

        // TODO: add file selection dialog
        $scope.IOing = true;
        H.loading('Preparing questions');

        FS.load(function(e, questions) {
          H.loading();
          if (e) {
            H.error('Resote Failed!', e.message);
            $scope.IOing = false;
            return;
          }

          var n = prettyNumber(questions.length);
          H.loading('<br/>Restoring ' + n + ' questions');

          DB.setQuestions(questions)
            .then(function(e) {
              H.loading();
              if (e) {
                H.error('Resote Failed!', e.message);
              } else {
                H.ok('Restore Succeed!', '<br/>Restored ' + n + ' questions');
                Stat.questions.dirty = true;
              }
              $scope.IOing = false;
            });
        });
      });
  };

  $scope.init();
});
