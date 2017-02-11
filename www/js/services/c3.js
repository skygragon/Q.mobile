var C3Service = {};

function onPageDone(gctx, wctx, e, id, questions) {
  if (questions) {
    if (questions.length === 0) {
      // hit last page, no need to get higher pages.
      console.log('No more questions after page=' + id);
      gctx.setMax(id);
    } else {
      var duplicated = gctx.cb(questions);

      // quit early if questions are dedup
      // unless we are doing a full scan
      if (duplicated && !gctx.full) {
        console.log('All duplicated on page=' + id);
        gctx.setMax(id);
      }
    }
  }

  // push back failed page, thus try it later
  if (e) {
    gctx.pages.unshift(id);
    console.log('recollect failed page:' + id);
  }

  workerRun(gctx, wctx);
};

function workerRun(gctx, wctx) {
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
  console.log('start getPage=' + id + ', worker=' + wctx.id);
  C3Service.getPage(id, wctx.cb);
}

C3Service.update = function(cb) {
  var workers = parseInt(this.Stat.updated.workers);

  // global shared context
  var gctx = {
    pages:    [],
    nextPage: 1,
    maxPage:  -1,
    workers:  workers,
    cb:       cb,

    setMax: function(id) {
      this.maxPage = this.maxPage < 0 ? id : Math.min(this.maxPage, id);
      this.pages = _.reject(this.pages, function(x) {
        return x >= id;
      });
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
    wctx.cb = _.partial(onPageDone, gctx, wctx)
    workerRun(gctx, wctx);
  }
};

C3Service.getPage = function(id, cb) {
  this.$http.get('https://careercup.com/page?n=' + id, {timeout: 5000})
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
      console.log('✘ getPage=' + id + ', error=' + status + '/' + data);
      return cb('HTTP:' + status, id);
    });
};

angular.module('Services')
.service('C3', ['$http', 'Stat', function($http, Stat) {
  C3Service.$http = $http;
  C3Service.Stat = Stat;
  return C3Service;
}]);
