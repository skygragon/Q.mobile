var cache = {
  keys: null,   // DB keys of all questions that fit the current filter
  idx: -1,      // current cursor in keys, for sequential mode only.
  filter: null  // current query filter
};

var DBService = {};

DBService.init = function($q) {
  this.$q = $q;
};

DBService.open = function() {
  var d = this.$q.defer();

  var db = new Dexie('c3.db');
  db.version(1).stores({
    // FIXME: remove useless 'rand' column
    questions: '++id,&name,status,rand,time,company,link,data,*tags'
  });

  // otherwise, create new DB connection
  db.open().then(function(db) {
    d.resolve(db);
  }).catch(function(e) {
    console.log('db open failed:', e.stack);
    d.resolve();
  });

  return d.promise;
};

DBService.countQuestions = function(tag) {
  var d = this.$q.defer();

  this.open().then(function(db) {
    if (!db) return d.resolve(0);

    var questions = db.questions;

    if (tag && tag !== '') {
      // count by given tag
      questions = questions.where('tags').anyOf([tag]);
    } else {
      // count all
      questions = questions.toCollection();
    }

    questions.count(function(n) {
      console.log('found ' + tag + ' = ' + n);
      d.resolve(n);
    });
  });

  return d.promise;
};

DBService.updateQuestions = function(questions) {
  var d = this.$q.defer();

  this.open().then(function(db) {
    if (!db) return d.resolve();

    db.questions
      .bulkPut(questions)
      .then(function(key) {
        d.resolve();
      })
      .catch(Dexie.BulkError, function (e) {
        // ignore put error of duplicate questions
        d.resolve(e);
      });
  });

  return d.promise;
};

DBService.filterQuestions = function(filter) {
  var d = this.$q.defer();

  this.open().then(function(db) {
    if (!db) return d.resolve(db);

    // use cached if filter not changed
    if (_.isEqual(filter, cache.filter)) {
      return d.resolve(db);
    }

    // otherwise we have to invalidate cache and re-collect
    // all questions that meet this new filter

    var questions = db.questions
      .where('status')
      .belowOrEqual(parseInt(filter.status));

    if (filter.tag !== '') {
      questions.and(function(q) {
        return q.tags.indexOf(filter.tag) >= 0;
      });
    }

    if (filter.company !== '') {
      questions.and(function(q) {
        return q.company === filter.company;
      });
    }

    questions.primaryKeys(function(keys) {
      cache.keys = keys;
      cache.idx = -1;
      cache.filter = _.clone(filter);
      d.resolve(db);
    });
  });

  return d.promise;
};

DBService.selectQuestion = function(filter) {
  var d = this.$q.defer();

  this.filterQuestions(filter).then(function(db) {
    if (!db) return d.resolve(null);

    var n = cache.keys.length;
    if (n === 0) return d.resolve(null);

    // TODO: sequential mode

    // random mode
    var idx = _.random(n - 1);
    var key = cache.keys[idx];

    console.debug('selected question id=' + key, idx + '/' + n);
    db.questions
      .get(key)
      .then(function(question) {
        d.resolve(question);
      });
  });

  return d.promise;
};

function match(filter, question) {
  return filter &&
    parseInt(filter.status) >= question.status &&
    (filter.company === '' || filter.company == question.company) &&
    (filter.tag === '' || question.tags.indexOf(filter.tag) >= 0);
}

DBService.updateQuestion = function(question) {
  var d = this.$q.defer();

  this.open().then(function(db) {
    if (!db) return d.resolve('DB Error');

    // for now only some keys will be updated
    db.questions
      .update(question.id, {
        status: question.status,
        tags: question.tags
      })
      .then(function(updated) {
        // remove this question from cache if not fit filter any more
        if (!match(cache.filter, question)) {
          var i = cache.keys.indexOf(question.id);
          if (i >= 0) cache.keys.splice(i, 1);
        }
        d.resolve();
      })
      .catch(function(e) {
        d.resolve(e);
      });
  });

  return d.promise;
};

DBService.getQuestions = function() {
  var d = this.$q.defer();

  this.open().then(function(db) {
    if (!db) return d.resolve(null);

    db.questions
      .toCollection()
      .toArray(function(questions) {
        d.resolve(questions);
      });
  });

  return d.promise;
};

DBService.setQuestions = function(questions) {
  var d = this.$q.defer();

  this.open().then(function(db) {
    if (!db) return d.resolve({message: 'DB Error'});

    db.questions
      .clear()
      .then(function() {
        db.questions
          .bulkPut(questions)
          .then(function(key) {
            d.resolve();
          })
          .catch(Dexie.BulkError, function (e) {
            d.resolve(e);
          });
      });
  });

  return d.promise;
};

angular.module('Services', [])
.service('DB', [ '$q' ,function($q) {
  DBService.init($q);
  return DBService;
}]);
