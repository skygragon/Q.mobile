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

LintcodeService.getPage = function(id, cb) {
  this.$http.get('http://www.lintcode.com/en/problem/?page=' + id)
    .success(function(data, status, headers, config) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(data, 'text/html');

      var questions = _.chain(doc.getElementsByTagName('a'))
        .filter(function(a) {
          return a.attributes['class'] &&
                 a.attributes['class'].value.indexOf('problem-panel') >= 0 &&
                 a.attributes['href'] &&
                 a.attributes['href'].value.indexOf('/problem/') === 0;
        })
        .map(function(a) {
          var question = {
            status: 0,
            name: '',
            title: '',
            link: 'http://www.lintcode.com/en' + a.attributes['href'].value,
            level: '',
            rate: ''
          };
          _.each(a.getElementsByTagName('span'), function(span) {
            var s = span.attributes['class'].value;
            var v = span.innerText.trim();

            if (s.indexOf('title') >= 0) {
              question.name = +v.split('.')[0].trim();
              question.title = v.split('.')[1].trim();
            } else if (s.indexOf('rate') >= 0)
              question.rate = v.split(' ')[0];
            else if (s.indexOf('difficulty') >= 0)
              question.level = v;

            /*
            _.each(span.getElementsByTagName('i'), function(i) {
              if (i.attributes['class'].value.indexOf('fa-briefcase') >= 0) {
                question.tags = _.map(span.attributes['title'].value.split(','), function(x) {
                  return x.trim();
                });
              }
            });*/
          });

          question.id = question.name;
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

      _.chain(doc.getElementsByTagName('div'))
        .filter(function(div) {
          return div.attributes['id'] &&
                 div.attributes['id'].value === 'description';
        })
        .each(function(div) {
          var divs = angular.element(div).children();
          question.data = divs[0].innerText.trim() + '\n\n' +
                          divs[1].innerText.trim();
        });

      question.tags = _.chain(doc.getElementsByTagName('a'))
        .filter(function(a) {
          return a.attributes['href'] &&
                 a.attributes['href'].value.indexOf('/tag/') === 0;
        })
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
  question.data = he.decode(question.data);
};

angular.module('Services')
.service('LintCode', ['$http', 'Stat', function($http, Stat) {
  LintcodeService.$http = $http;
  LintcodeService.Stat = Stat;
  return LintcodeService;
}]);
