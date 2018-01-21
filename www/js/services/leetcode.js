var Leetcode = {
  dbkeys: [
    'accepts',
    'data',
    'id',
    'key',
    'level',
    'locked',
    'status',
    'submits',
    'tags',
    'title'
  ]
};

function onLeetcodeQuestionTask(question, q, cb) {
  Leetcode.getQuestion(question, function(e, question) {
    if (e) {
      q.addTask(question);
      console.log('recollect failed question=' + question.id);
    } else {
      // if hit duplicate, skip those questions before this one
      // unless user wants a full scan
      if (q.ctx.cb([question]) && !q.ctx.fully) {
        console.log('Find duplicated on question=' + question.id);
        q.tasks = _.reject(q.tasks, function(x) {
          return x.id <= question.id;
        });
      }
    }
    return cb();
  });
}

Leetcode.update = function(cb) {
  this.$http.get('https://leetcode.com/api/problems/algorithms/')
    .success(function(data, status, headers, config) {
      var questions = _.chain(data.stat_status_pairs)
          .filter(function(p) { return !p.stat.question__hide; })
          .map(function(p) {
            var question = {
              status:  0,
              id:      p.stat.question_id,
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

      var ctx = {
        cb:    cb,
        fully: Leetcode.Stat.updated.fully
      };
      var q = new Leetcode.Queue(questions, ctx, onLeetcodeQuestionTask);
      var n = parseInt(Leetcode.Stat.updated.workers);
      q.run(n, function(e, ctx) {
        return cb();
      });
    })
    .error(function(data, status, headers, config) {
      console.log('✘ getQuestions, error=' + status + '/' +data);
      return cb();
    });
};

Leetcode.getQuestion = function(question, cb) {
  console.log('start getQuestion=' + question.id);
  if (question.locked) {
    // TODO: show locked?
    console.log('skip locked question=' + question.id);
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

      console.log('✔ getQuestion=' + question.id);
      return cb(null, question);
    })
    .error(function(data, status, headers, config) {
      console.log('✘ getQuestion=' + question.id + ', error=' + status + '/' + data);
      return cb('HTTP:' + status);
    });
};

var LEVELS = ['', 'Easy', 'Medium', 'Hard'];

Leetcode.fixupQuestion = function(question) {
  question.rate = question.accepts * 100 / question.submits;
  question.levelName = LEVELS[question.level];
  question.levelIndex = question.level;
  question.link = 'https://leetcode.com/problems/' + question.key;
  question.data = he.decode(question.data);
};

angular.module('Services')
.service('LeetCode', ['$http', 'Stat', 'Queue', function($http, Stat, Queue) {
  Leetcode.$http = $http;
  Leetcode.Stat = Stat;
  Leetcode.Queue = Queue;
  return Leetcode;
}]);
