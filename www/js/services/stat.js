StatService = {
  tags: ['Resolved', 'Later', 'Favorite'],

  // settings
  filter: {
    status:  '0', // by status, 0=new, 1=resolved
    tag:     '',  // by tag
    company: ''   // by company
  },

  // stat of all existing questions in DB
  questions: {
    count: {All: 0}, // statistics of questions
    d:     null,     // defer object, will be resolved when all tasks done
    tasks: 0,        // how many tasks waiting for DB
    dirty: true      // if ture, need to recalculate stat from DB
  },

  // stat during updating questions
  updated: {
    full:      false, // if true, do a full crawl on all question pages
    workers:   '16',  // how many workers to crawl questions
    questions: 0,     // how many questions got so far
    pages:     0      // how mant pages processed so far
  }
};

StatService.init = function($q, DB) {
  this.$q = $q;
  this.DB = DB;

  var self = this;
  this.tags.forEach(function(tag) {
    self.questions.count[tag] = 0;
  });
};

StatService.query = function(tag) {
  ++this.questions.tasks;

  var self = this;
  this.DB
      .countQuestions(tag)
      .then(function(n) {
        self.onTaskDone(tag, n);
      });
};

StatService.onTaskDone = function(tag, n) {
  this.questions.count[tag || 'All'] = n;
  if (--this.questions.tasks > 0) return;

  this.questions.dirty = false;
  this.questions.d.resolve();
};

StatService.refresh = function() {
  var d = this.$q.defer();
  this.questions.d = d;

  this.query();

  var self = this;
  this.tags.forEach(function(tag) {
    self.query(tag);
  });

  return d.promise;
};

angular.module('Services')
.service('Stat', [ '$q', 'DB', function($q, DB) {
  StatService.init($q, DB);
  return StatService;
}]);
