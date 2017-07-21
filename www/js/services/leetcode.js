var LeetcodeService = {};

function onLeetcodeQuestionDone(gctx, wctx, e, question) {
  if (e) {
    // push back failed question, thus try it later
    gctx.questions.unshift(question);
    console.log('recollect failed question=' + question.name);
  } else {
    var duplicated = gctx.cb([question]);

    // quit early if question is dedup unless doing a full scan
    if (duplicated && !gctx.full) {
      console.log('Find duplicated on question=' + question.name);
      gctx.questions = _.reject(gctx.questions, function(x) {
        return x.name <= question.name;
      });
    }
  }

  leetcodeWorkerRun(gctx, wctx);
};

function leetcodeWorkerRun(gctx, wctx) {
  if (gctx.questions.length === 0) {
    console.log('Quit now, worker=' + wctx.id);
    if (--gctx.workers === 0) gctx.cb();
    return;
  }

  var question = gctx.questions.shift();
  console.log('start getQuestion=' + question.name + ', worker=' + wctx.id);
  LeetcodeService.getQuestion(question, wctx.cb);
}

LeetcodeService.update = function(cb) {
  var workers = parseInt(this.Stat.updated.workers);

  // global shared context
  var gctx = {
    questions: [],
    workers:   workers,
    cb:        cb,
    full:      this.Stat.updated.full,
  };

  this.$http.get('https://leetcode.com/api/problems/algorithms/')
    .success(function(data, status, headers, config) {
      var questions = _.chain(data.stat_status_pairs)
          .filter(function(p) { return !p.stat.question__hide; })
          .map(function(p) {
            var question = {
              status:  0,
              name:    p.stat.question_id,
              title:   p.stat.question__title,
              key:     p.stat.question__title_slug,
              link:    'https://leetcode.com/problems/' + p.stat.question__title_slug,
              locked:  p.paid_only,
              accepts: p.stat.total_acs,
              submits: p.stat.total_submitted,
              level:   p.difficulty.level
            };

            return question;
          })
          .value();

      gctx.questions = questions;
      for (var i = 0; i < workers; ++i) {
        // worker individual context
        var wctx = {id: i};
        wctx.cb = _.partial(onLeetcodeQuestionDone, gctx, wctx)
        leetcodeWorkerRun(gctx, wctx);
      }
    })
    .error(function(data, status, headers, config) {
      console.log('✘ getQuestions, error=' + status + '/' +data);
      return cb(null);
    });
};

LeetcodeService.getQuestion = function(question, cb) {
  // TODO: show locked?
  if (question.locked) {
    console.log('skip locked question=' + question.name);
    question.data = 'Question Locked';
    question.tags = [];
    return cb(null, question);
  }

  this.$http.get(question.link)
    .success(function(data, status, headers, config) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(data, 'text/html');

      _.each(doc.getElementsByTagName('meta'), function(meta) {
        if (meta.attributes['name'] &&
            meta.attributes['name'].value === 'description') {
          question.data = meta.attributes['content'].value;
        }
      });

      question.tags = _.chain(doc.getElementsByTagName('a'))
        .filter(function(a) {
          return a.attributes['href'] &&
                 a.attributes['href'].value.indexOf('/tag/') === 0;
        })
        .map(function(a) { return a.innerText.trim(); })
        .value();

      var r = /(var pageData[^;]+;)/m;
      var result = data.match(r);
      if (!result) {
        question.locked = true;
        question.data = 'Question Locked';
        question.tags = [];
      }

      console.log('✔ getQuestion=' + question.name);
      return cb(null, question);
    })
    .error(function(data, status, headers, config) {
      console.log('✘ getQuestion=' + question.name + ', error=' + status + '/' + data);
      return cb('HTTP:' + status, question);
    });
};

var LEVELS = ['', 'Easy', 'Medium', 'Hard'];

LeetcodeService.fixupQuestion = function(question) {
  question.rate = question.accepts * 100 / question.submits;
  question.levelName = LEVELS[question.level];
  question.levelIndex = question.level;
  question.link = 'https://leetcode.com/problems/' + question.key;
  question.data = he.decode(question.data);
};

angular.module('Services')
.service('LeetCode', ['$http', 'Stat', function($http, Stat) {
  LeetcodeService.$http = $http;
  LeetcodeService.Stat = Stat;
  return LeetcodeService;
}]);
