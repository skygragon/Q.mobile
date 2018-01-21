var Lintcode = {};

function onLintcodePageDone(gctx, wctx, e, id, questions) {
  if (e) {
    gctx.pages.unshift(id);
    console.log('recollect failed page=' + id);
  } else if (questions.length === 0) {
    // hit empty page, no need fetch more
    if (gctx.maxPage < 0) {
      gctx.maxPage = id;
      gctx.pages = _.reject(gctx.pages, function(x) {
        return x >= id;
      });
    }
  } else {
    gctx.questions = _.sortBy(gctx.questions.concat(questions), function(x) {
      return -x.name;
    });
  }

  lintcodeWorkerRun(gctx, wctx);
}

function onLintcodeQuestionDone(gctx, wctx, e, question) {
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

  lintcodeWorkerRun(gctx, wctx);
};

function lintcodeWorkerRun(gctx, wctx) {
  if (gctx.pages.length > 0) {
    var id = gctx.pages.shift();
    console.log('start getPage=' + id + ', worker=' + wctx.id);
    Lintcode.getPage(id, wctx.pageCB);
    return;
  }

  if (gctx.questions.length > 0) {
    var question = gctx.questions.shift();
    console.log('start getQuestion=' + question.name + ', worker=' + wctx.id);
    Lintcode.getQuestion(question, wctx.questionCB);
    return;
  }

  console.log('Quit now, worker=' + wctx.id);
  if (--gctx.workers === 0) gctx.cb();
}

Lintcode.update = function(cb) {
  var workers = parseInt(this.Stat.updated.workers);

  // global shared context
  var gctx = {
    pages:     _.range(16), // FIXME: dynamic page numbers
    questions: [],
    maxPage:   -1,
    workers:   workers,
    cb:        cb,
    full:      this.Stat.updated.full,
  };

  for (var i = 0; i < workers; ++i) {
    // worker individual context
    var wctx = {id: i};
    wctx.pageCB = _.partial(onLintcodePageDone, gctx, wctx);
    wctx.questionCB = _.partial(onLintcodeQuestionDone, gctx, wctx);
    lintcodeWorkerRun(gctx, wctx);
  }
};

function attr(dom, key) { return (dom.attributes[key] && dom.attributes[key].value) || ''; }
function child(dom) { return angular.element(dom).children(); }

Lintcode.getPage = function(id, cb) {
  this.$http.get('http://www.lintcode.com/api/problems/?page=' + id)
    .success(function(data, status, headers, config) {
      var questions = (data.problems || []).map(function(p) {
        var q = {
          key:    p.unique_name,
          level:  p.level,
          link:   'http://www.lintcode.com/problem/' + p.unique_name,
          name:   p.id,
          rate:   p.accepted_rate,
          status: 0,
          title:  p.title
        };
        return q;
      });
      console.log('✔ getPage=' + id + ', questions=' + questions.length);
      return cb(null, id, questions);
    })
    .error(function(data, status, headers, config) {
      console.log('✔ getPage=' + id + ', questions=0');
      if (status === 404) return cb(null, id, []);

      console.log('✘ getPage=' + id +', error=' + status + '/' +data);
      return cb('HTTP error=' + status, id);
    });
};

Lintcode.getQuestion = function(question, cb) {
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

      console.log('✔ getQuestion=' + question.name);
      return cb(null, question);
    })
    .error(function(data, status, headers, config) {
      console.log('✘ getQuestion=' + question.name + ', error=' + status + '/' + data);
      return cb('HTTP:' + status, question);
    });
};

var LEVELS = ['Naive', 'Easy', 'Medium', 'Hard', 'Super'];

Lintcode.fixupQuestion = function(question) {
  question.levelName = LEVELS[question.level];
  question.levelIndex = question.level;
  question.data = he.decode(question.data);
};

angular.module('Services')
.service('LintCode', ['$http', 'Stat', function($http, Stat) {
  Lintcode.$http = $http;
  Lintcode.Stat = Stat;
  return Lintcode;
}]);
