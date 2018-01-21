var DB = {};

DB.init = function() {
  this.db = null;
  this.idx = -1;
  this.keys = null;    // keys of all questions that fit the current filter
  this.filter = null;  // current query filter
};

DB.open = function() {
  var d = this.$q.defer();

  var db = new Dexie(this.dbname);
  db.version(1).stores({
    questions: '++id,status,company,*tags'
  });

  db.open()
    .then(function(db) {
      DB.db = db;
      d.resolve(db);
    })
    .catch(function(e) {
      console.log('db open failed:', e.stack);
      d.reject(e);
    });

  return d.promise;
};

DB.countQuestions = function(tag) {
  var questions = this.db.questions;

  if (tag && tag !== '') {
    // count by given tag
    questions = questions.where('tags').anyOf([tag]);
  } else {
    // count all
    questions = questions.toCollection();
  }

  return questions.count();
};

DB.updateQuestions = function(questions, keys) {
  var d = this.$q.defer();
  if (keys) questions = questions.map(function(x) {
    return _.pick(x, keys);
  });

  this.db.questions
    .bulkPut(questions)
    .then(function(key) {
      d.resolve();
    })
    .catch(Dexie.BulkError, function (e) {
      // ignore put error of duplicate questions
      d.resolve(e);
    });

  return d.promise;
};

DB.filterQuestions = function(filter) {
  var d = this.$q.defer();

  // use cached if filter not changed
  if (_.isEqual(filter, this.filter)) {
    d.resolve();
    return d.promise;
  }

  // otherwise we have to invalidate cache and re-collect
  // all questions that meet this new filter
  var questions = this.db.questions
    .where('status')
    .belowOrEqual(+filter.status);

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

  if (filter.level !== '') {
    questions.and(function(q) {
      return q.level === +filter.level;
    });
  }

  // FIXME: will this be slow??
  questions.sortBy('name')
    .then(function(sortedQuestions) {
      var keys = _.map(sortedQuestions, function(question) {
        return question.id;
      });
      // console.log(JSON.stringify(keys));
      DB.keys = keys;
      DB.filter = _.clone(filter);

      d.resolve();
  });

  return d.promise;
};

DB.selectQuestion = function(filter) {
  var d = this.$q.defer();

  this.filterQuestions(_.omit(filter, 'algo', 'reversed'))
    .then(function() {
      var n = DB.keys.length;
      if (n === 0) return d.resolve(null);

      var i = DB.idx;
      if (filter.algo === 'Random') {
        i = _.random(n - 1);
      } else {
        var step = filter.reversed ? -1 : 1;
        i = (i + step + n) % n;
      }
      var id = DB.keys[i];

      console.debug('selected question id=' + id + ',' + i + '-th of ' + n);
      DB.db.questions
        .get(id)
        .then(function(question) {
          DB.idx = i;
          d.resolve(question);
        });
    });

  return d.promise;
};

function match(f, q) {
  return f &&
    +f.status >= q.status &&
    (f.company === '' || f.company === q.company) &&
    (f.tag === '' || q.tags.indexOf(f.tag) >= 0);
}

DB.updateQuestion = function(question, keys) {
  var d = this.$q.defer();
  var toUpdate = keys ? _.pick(question, keys) : question;

  // if given, only specific keys will be updated
  this.db.questions
    .update(question.id, toUpdate)
    .then(function(updated) {
      // remove this question from cache if not fit filter any more
      if (!match(DB.filter, question)) {
        var i = DB.keys.indexOf(question.id);
        if (i >= 0) DB.keys.splice(i, 1);
      }

      d.resolve();
    })
    .catch(function(e) {
      d.resolve(e);
    });

  return d.promise;
};

DB.getQuestions = function() {
  return this.db.questions.toCollection().toArray();
};

DB.setQuestions = function(questions) {
  var d = this.$q.defer();

  questions = questions.map(function(q) {
    return _.omit(q, 'rand', 'link');
  });

  this.db.questions
    .clear()
    .then(function() {
      DB.db.questions
        .bulkPut(questions)
        .then(function(key) {
          d.resolve();
        })
        .catch(Dexie.BulkError, function (e) {
          d.resolve(e);
        });
    });

  return d.promise;
};

angular.module('Services')
.service('DB', [ '$q', 'Config' ,function($q, Config) {
  DB.$q = $q;
  DB.dbname = Config.name + '.db';

  DB.init();
  return DB;
}]);
