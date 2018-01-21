var C3 = {};

function onC3PageDone(gctx, wctx, e, id, questions) {
  if (questions) {
    if (questions.length === 0) {
      // hit last page, no need to get higher pages.
      console.log('No more questions after page=' + id);
      gctx.onPageEnd(id);
    } else {
      var duplicated = gctx.cb(questions);

      // quit early if questions are dedup
      // unless we are doing a full scan
      if (duplicated && !gctx.full) {
        console.log('All duplicated on page=' + id);
        gctx.onPageEnd(id);
      }
    }
  }

  // push back failed page, thus try it later
  if (e) {
    gctx.onPageFail(id);
    console.log('recollect failed page:' + id);
  } else {
    gctx.onPageDone(id);
  }

  c3WorkerRun(gctx, wctx);
};

function c3WorkerRun(gctx, wctx) {
  if (gctx.pages.length === 0) {
    if (gctx.maxPage > 0) {
      // no more pages to do, let worker quit
      console.log('No more works to do, quit now, id=', wctx.id);
      return gctx.onWorkerDone(wctx.id);
    } else {
      // scan more pages if existing pages are all done
      gctx.advance(100);
    }
  }

  var id = gctx.pages.shift();
  var opts = {
    // linear timeout on retry, 60 seconds at most
    timeout: Math.min((gctx.badPages[id] || 1) * 5000, 60 * 1000)
  };
  console.log('start getPage=' + id +
              ', worker=' + wctx.id +
              ', timeout=' + opts.timeout);
  C3.getPage(id, opts, wctx.cb);
}

C3.update = function(cb) {
  var workers = parseInt(this.Stat.updated.workers);

  // global shared context
  var gctx = {
    pages:    [],       // id of new pages to do
    badPages: {},       // failed count of each page
    nextPage: 1,
    maxPage:  -1,
    workers:  workers,
    cb:       cb,
    full:     this.Stat.updated.full,

    onPageEnd: function(id) {
      this.maxPage = this.maxPage < 0 ? id : Math.min(this.maxPage, id);
      this.pages = _.reject(this.pages, function(x) {
        return x >= id;
      });
    },

    onPageFail: function(id) {
      this.pages.unshift(id);
      this.badPages[id] = (this.badPages[id] || 0) + 1;
    },

    onPageDone: function(id) {
      delete this.badPages[id];
    },

    advance: function(n) {
      this.pages = _.range(this.nextPage, this.nextPage + n);
      this.nextPage += n;
    },

    onWorkerDone: function(id) {
      if (--this.workers === 0) this.cb();
    }
  };

  for (var i = 0; i < workers; ++i) {
    // worker individual context
    var wctx = {id: i};
    wctx.cb = _.partial(onC3PageDone, gctx, wctx)
    c3WorkerRun(gctx, wctx);
  }
};

C3.getPage = function(id, opts, cb) {
  this.$http.get('https://careercup.com/page?n=' + id, opts)
    .success(function(data, status, headers, config) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(data, 'text/html');

      var questions = _.chain(doc.getElementsByTagName('li'))
        .filter(function(x) {
          return x.className === 'question';
        })
        .map(function(x) {
          var q = {
            status: 0,
          };
          _.each(x.getElementsByTagName('span'), function(x) {
            switch(x.className) {
              case 'entry':
                var a = x.getElementsByTagName('a')[0];
                q.name = _.last(a.attributes['href'].value.split('id='));
                q.data = a.text;
                break;
              case 'company':
                q.company = x.getElementsByTagName('img')[0].title;
                break;
              case 'tags':
                q.tags = _.map(x.getElementsByTagName('a'), function(y) {
                  return y.text;
                });
                break;
              default:
                break;
            }
          });

          q.time = x.getElementsByTagName('abbr')[0].title;

          return q;
        })
        .value();

      console.log('✔ getPage=' + id + ', questions=' + questions.length);
      return cb(null, id, questions);
    })
    .error(function(data, status, headers, config) {
      console.log('✘ getPage=' + id +
                  ', error=' + status + '/' + data +
                  ', timeout=' + opts.timeout);
      return cb('HTTP:' + status, id);
    });
};

C3.fixupQuestion = function(question) {
  question.link = 'https://careercup.com/question?id=' + question.name;
  question.data = he.decode(question.data);
};

angular.module('Services')
.service('C3', ['$http', 'Stat', function($http, Stat) {
  C3.$http = $http;
  C3.Stat = Stat;
  return C3;
}]);
