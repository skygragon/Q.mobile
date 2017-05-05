var LintcodeService = {};

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
    // FIXME: check to see if questions are deduped!
    gctx.questions = gctx.questions.concat(questions);
  }

  lintcodeWorkerRun(gctx, wctx);
}

function onLintcodeQuestionDone(gctx, wctx, e, question) {
  if (e) {
    // push back failed question, thus try it later
    gctx.questions.unshift(question);
    console.log('recollect failed question=' + question.name);
  } else {
    gctx.cb([question]);
  }

  lintcodeWorkerRun(gctx, wctx);
};

function lintcodeWorkerRun(gctx, wctx) {
  if (gctx.pages.length > 0) {
    var id = gctx.pages.shift();
    console.log('start getPage=' + id + ', worker=' + wctx.id);
    LintcodeService.getPage(id, wctx.pageCB);
    return;
  }

  if (gctx.questions.length > 0) {
    var question = gctx.questions.shift();
    console.log('start getQuestion=' + question.name + ', worker=' + wctx.id);
    LintcodeService.getQuestion(question, wctx.questionCB);
    return;
  }

  console.log('Quit now, worker=' + wctx.id);
  if (--gctx.workers === 0) gctx.cb();
}

LintcodeService.update = function(cb) {
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

LintcodeService.getPage = function(id, cb) {
  this.$http.get('http://www.lintcode.com/en/problem/?page=' + id)
    .success(function(data, status, headers, config) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(data, 'text/html');

      var questions = _.chain(doc.getElementsByTagName('a'))
        .filter(function(a) {
          return attr(a, 'class').indexOf('problem-panel') >= 0 &&
                 attr(a, 'href').indexOf('/problem/') === 0;
        })
        .map(function(a) {
          var question = { status: 0, name: '', title: '', level: '', rate: '' };

          _.each(a.getElementsByTagName('span'), function(span) {
            var s = attr(span, 'class');
            var v = span.innerText.trim();

            if (s.indexOf('title') >= 0) {
              question.name = +v.split('.')[0].trim();
              question.title = v.split('.')[1].trim();
            } else if (s.indexOf('rate') >= 0)
              question.rate = v.split(' ')[0];
            else if (s.indexOf('difficulty') >= 0)
              question.level = v;
          });

          question.id = question.name;
          question.key = attr(a, 'href');
          question.link = 'http://www.lintcode.com/en' + question.key;
          return question;
        })
        .value();

      console.log('✔ getPage=' + id + ', questions=' + questions.length);
      return cb(null, id, questions);
    })
    .error(function(data, status, headers, config) {
      console.log('✘ getPage=' + id +', error=' + status + '/' +data);
      return cb('HTTP error=' + status, id);
    });
};

LintcodeService.getQuestion = function(question, cb) {
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

var LEVELS = ['', 'Easy', 'Medium', 'Hard'];

LintcodeService.fixupQuestion = function(question) {
  question.levelName = question.level;
  question.levelIndex = LEVELS.indexOf(question.level);
  question.link = 'http://www.lintcode.com/en' + question.key;
  question.data = he.decode(question.data);
};

angular.module('Services')
.service('LintCode', ['$http', 'Stat', function($http, Stat) {
  LintcodeService.$http = $http;
  LintcodeService.Stat = Stat;
  return LintcodeService;
}]);
