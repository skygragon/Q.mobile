var DBService = {};

DBService.open = function() {
  var db = new this.Dexie("c3.db");
  db.version(1).stores({
    questions: '++id,&name,status,rand,time,company,link,data,*tags'
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

DBService.getQuestion = function(cond, cb) {
  this.open().then(function(db) {
    var rand = Math.random();
    var questions = db.questions.where('status').equals(0);

    questions.and(function(q) {
      return q.rand >= rand;
    })
    .last(function(q) {
      if (q) return cb(q);

      // no such question, try again
      questions.and(function(q) {
        return q.rand < rand;
      })
      .first(cb);
    });
  });
};

DBService.updateQuestion = function(question, cb) {
  this.open().then(function(db) {
    // for now only some keys will be updated
    db.questions
      .update(question.id, {
        status: question.status,
        tags: question.tags
      })
      .then(cb);
  });
};

angular.module('Services')
.service('DB', [ 'Dexie', function(Dexie) {
  DBService.Dexie = Dexie;
  return DBService;
}]);

