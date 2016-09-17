var DBService = {};

DBService.open = function() {
  var db = new this.Dexie("c3.db");
  db.version(1).stores({
    questions: '++id,&name,status,rand,time,company,link,data,*tags'
  });
  return db.open();
};

DBService.countQuestions = function(tag, cb) {
  this.open().then(function(db) {
    var questions = db.questions;
    if (tag && tag.length > 0) {
      questions = questions.where('tags').anyOf([tag]);
    } else {
      questions = questions.toCollection();
    }

    return questions.count(cb);
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
        cb(e);
      });
  });
};

DBService.getQuestion = function(filter, cb) {
  this.open().then(function(db) {
    filter = filter || {};

    // only get unresolved by default
    var status = filter.status || '0';
    var questions = db.questions
      .where('status')
      .belowOrEqual(parseInt(status));

    if (filter.tag && filter.tag.length > 0) {
      questions.and(function(q) {
        return q.tags.indexOf(filter.tag) >= 0;
      });
    }

    if (filter.company && filter.company.length > 0) {
      questions.and(function(q) {
        return q.company === filter.company;
      });
    }

    questions
      .count(function(n) {
        var rand = _.random(n);
        questions.offset(rand)
          .first(function(q) {
            console.log(n, rand, q.rand);
            cb(q);
          });
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

angular.module('Services', [])
.service('DB', [ 'Dexie', '_', function(Dexie, _) {
  DBService.Dexie = Dexie;
  DBService._ = _;
  return DBService;
}]);
