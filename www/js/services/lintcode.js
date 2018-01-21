var Lintcode = {
  dbkeys: [
    'data',
    'id',
    'key',
    'level',
    'rate',
    'status',
    'tags',
    'title'
  ]
};

function onLintcodePageTask(id, q, cb) {
  Lintcode.getPage(id, function(e, questions) {
    if (e) {
      q.addTask(id);
      console.log('recollect failed page=' + id);
    } else if (questions.length === 0 && id > 0) {
      // hit empty page, no need fetch more
      q.tasks = _.reject(q.tasks, function(x) {
        return x >= id;
      });
    } else {
      q.ctx.questions = q.ctx.questions.concat(questions);
    }
    return cb();
  });
}

function onLintcodeQuestionTask(question, q, cb) {
  Lintcode.getQuestion(question, function(e, qustions) {
    if (e) {
      q.addTask(question);
      console.log('recollect failed question=' + question.id);
    } else {
      // if hit duplicate, skip those questions before this one
      // unless user wants a full scan
      if (q.ctx.cb([question]) && !q.ctx.full) {
        console.log('Find duplicated on question=' + question.id);
        q.tasks = _.reject(q.tasks, function(x) {
          return x.id <= question.id;
        });
      }
    }
    return cb();
  });
}

Lintcode.update = function(cb) {
  var ctx = {questions: []};
  // FIXME: dynamic page numbers
  var q = new this.Queue(_.range(16), ctx, onLintcodePageTask);

  var n = parseInt(this.Stat.updated.workers);
  q.run(n, function(e, ctx) {
    var questions = _.sortBy(ctx.questions, function(x) {
      return -x.id;
    });

    ctx = {
      cb:   cb,
      full: Lintcode.Stat.updated.full
    };
    q = new Lintcode.Queue(questions, ctx, onLintcodeQuestionTask);
    q.run(n, function(e, ctx) {
      return cb();
    });
  });
};

function attr(dom, key) { return (dom.attributes[key] && dom.attributes[key].value) || ''; }
function child(dom) { return angular.element(dom).children(); }

Lintcode.getPage = function(id, cb) {
  console.log('start getPage=' + id);
  this.$http.get('http://www.lintcode.com/api/problems/?page=' + id)
    .success(function(data, status, headers, config) {
      var questions = (data.problems || []).map(function(p) {
        var q = {
          key:    p.unique_name,
          level:  p.level,
          link:   'http://www.lintcode.com/problem/' + p.unique_name,
          id:     p.id,
          rate:   p.accepted_rate,
          status: 0,
          title:  p.title
        };
        return q;
      });
      console.log('✔ getPage=' + id + ', questions=' + questions.length);
      return cb(null, questions);
    })
    .error(function(data, status, headers, config) {
      console.log('✔ getPage=' + id + ', questions=0');
      if (status === 404) return cb(null, []);

      console.log('✘ getPage=' + id +', error=' + status + '/' +data);
      return cb('HTTP error=' + status, id);
    });
};

Lintcode.getQuestion = function(question, cb) {
  console.log('start getQuestion=' + question.id);
  this.$http.get(question.link)
    .success(function(data, status, headers, config) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(data, 'text/html');

      question.data = _.chain(doc.getElementsByTagName('div'))
        .filter(function(div) { return attr(div, 'id') === 'description'; })
        .map(function(div) { return Array.prototype.slice.call(child(div)); })
        .flatten()
        .filter(function(div) {
          var a = child(div)[0];
          return a.tagName != 'A' || attr(a, 'href') === '#challenge';
        })
        .map(function(div) { return div.innerText.trim(); })
        .value()
        .join('\n\n');

      question.tags = _.chain(doc.getElementsByTagName('a'))
        .filter(function(a) { return attr(a, 'href').indexOf('/tag/') === 0; })
        .map(function(a) { return a.innerText.trim(); })
        .value();

      console.log('✔ getQuestion=' + question.id);
      return cb(null, question);
    })
    .error(function(data, status, headers, config) {
      console.log('✘ getQuestion=' + question.id + ', error=' + status + '/' + data);
      return cb('HTTP:' + status, question);
    });
};

var LEVELS = ['Naive', 'Easy', 'Medium', 'Hard', 'Super'];

Lintcode.fixupQuestion = function(question) {
  question.levelName = LEVELS[question.level];
  question.levelIndex = question.level;
  question.link = 'http://www.lintcode.com/problem/' + question.key,
  question.data = he.decode(question.data);
};

angular.module('Services')
.service('LintCode', ['$http', 'Stat', 'Queue', function($http, Stat, Queue) {
  Lintcode.$http = $http;
  Lintcode.Stat = Stat;
  Lintcode.Queue = Queue;
  return Lintcode;
}]);
