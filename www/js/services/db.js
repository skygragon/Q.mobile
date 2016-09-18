var DBService = {
  ctx: {keys: null, idx:0, filter: null}
};

var DB_NOT_READY = 'DB not ready yet';

DBService.init = function(Dexie, _) {
  this.Dexie = Dexie;
  this._ = _;
  this.db = null;
};

DBService.open = function(cb) {
  if (this.db) return cb(this.db);

  var _db = new this.Dexie("c3.db");
  _db.version(1).stores({
    questions: '++id,&name,status,rand,time,company,link,data,*tags'
  });

  var self = this;
  _db.open().then(function(db) {
    // caching db instance to speedup
    self.db = db;
    return cb(db);
  });
};

DBService.countQuestions = function(tag, cb) {
  this.open(function(db) {
    var questions = db.questions;
    if (tag && tag.length > 0) {
      questions = questions.where('tags').anyOf([tag]);
    } else {
      questions = questions.toCollection();
    }

    questions.count(cb);
  });
};

DBService.updateQuestions = function(questions, cb) {
  this.open(function(db) {
    db.questions
      .bulkPut(questions)
      .then(function(key) {
        cb();
      })
      .catch(Dexie.BulkError, function (e) {
        // ignore put error of duplicate questions
        cb(e);
      });
  });
};

DBService.filterQuestions = function(filter, cb) {
  var self = this;
  this.open(function(db) {
    if (_.isEqual(filter, self.ctx.filter)) {
      return cb(db, self.ctx);
    }
    // otherwise new filter will invalidate ctx, which means we
    // have to re-collect the questions to meet this new filter

    var questions = db.questions
      .where('status')
      .belowOrEqual(parseInt(filter.status));

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

    questions.primaryKeys(function(keys) {
      self.ctx = {
        keys: keys,
        idx: 0,
        filter: _.clone(filter)
      };
      return cb(db, self.ctx);
    });
  });
};

DBService.selectQuestion = function(filter, cb) {
  this.filterQuestions(filter, function(db, ctx) {
    var n = ctx.keys.length;
    if (n === 0) return cb(null);

    // TODO: ordered mode

    // random mode
    var idx = _.random(n - 1);
    var key = ctx.keys[idx];

    console.debug('selected question id=' + key, idx + '/' + n);
    return db.questions.get(key).then(cb);
  });
};

DBService.updateQuestion = function(question, cb) {
  this.open(function(db) {
    // for now only some keys will be updated
    db.questions
      .update(question.id, {
        status: question.status,
        tags: question.tags
      })
      .then(cb);
  });
};

DBService.getQuestions = function(cb) {
  this.open(function(db) {
    db.questions
      .toCollection()
      .toArray(cb);
  });
};

DBService.setQuestions = function(questions, cb) {
  this.open(function(db) {
    db.questions
      .clear()
      .then(function() {
        db.questions
          .bulkPut(questions)
          .then(function(key) {
            cb();
          })
          .catch(Dexie.BulkError, function (e) {
            cb(e);
          });
      });
  });
};

angular.module('Services', [])
.service('DB', [ 'Dexie', '_', function(Dexie, _) {
  DBService.init(Dexie, _);
  return DBService;
}]);
