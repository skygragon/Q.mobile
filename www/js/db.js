var DBService = {};

DBService.open = function() {
  var db = new this.Dexie("c3.db");
  db.version(1).stores({
    questions: '++id,&name,rand,time,company,link,data,tags'
  });
  return db.open();
};

DBService.countQuestions = function(cb) {
  this.open().then(function(db) {
    db.questions
      .toCollection()
      .count(cb);
  });
};

DBService.updateQuestions = function(questions, cb) {
  this.open().then(function(db) {
    db.questions
      .bulkPut(questions)
      .then(function() {
        cb();
      })
      .catch(Dexie.BulkError, function (e) {
        // ignore put error of duplicate questions
        cb(e)
      });
  });
};

angular.module('Services')
.service('DB', [ 'Dexie', function(Dexie) {
  DBService.Dexie = Dexie;
  return DBService;
}]);

