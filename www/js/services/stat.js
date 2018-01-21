var Stat = {
  tags: ['Resolved', 'Later', 'Favorite'],

  // settings
  filter: {
    algo:    'Random', // selection algo
    status:  '0',      // by status, 0=new, 1=resolved
    tag:     '',       // by tag
    company: '',       // by company
    level:   '',       // by level
  },

  // stat of all existing questions in DB
  questions: {
    count: {All: 0}, // statistics of questions
    dirty: true      // if ture, need to recalculate stat from DB
  },

  // stat during updating questions
  updated: {
    wifiOnly:  true,  // if true, only updaing in wifi mode.
    full:      false, // if true, do a full crawl on all question pages
    workers:   '16',  // how many workers to crawl questions
    questions: 0,     // how many questions got so far
    pages:     0      // how mant pages processed so far
  }
};

Stat.init = function() {
  for (var i = 0; i < this.tags.length; ++i)
    this.questions.count[this.tags[i]] = 0;
};

function onStatQueryTask(tag, q, cb) {
  Stat.DB
      .countQuestions(tag)
      .then(function(n) {
        Stat.questions.count[tag || 'All'] = n;
        return cb();
      });
};

Stat.refresh = function() {
  var d = this.$q.defer();
  var q = new this.Queue(this.tags, null, onStatQueryTask);
  q.addTask('');
  q.run(null, function(e) {
    Stat.questions.dirty = false;
    d.resolve();
  });
  return d.promise;
};

angular.module('Services')
.service('Stat', [ '$q', 'DB', 'Queue', function($q, DB, Queue) {
  Stat.$q = $q;
  Stat.DB = DB;
  Stat.Queue = Queue;

  Stat.init();
  return Stat;
}]);
