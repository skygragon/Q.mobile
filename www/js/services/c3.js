var C3Service = {};

function onWorkerDone(ctx, msg) {
  console.log(msg);
  // all workers quit, notify caller
  if (--ctx.workers === 0)
    ctx.cb();
}

function onPageDone(ctx, e, questions) {
  if (questions) {
    if (questions.length === 0)
      return onWorkerDone(ctx, 'no more questions found, quit now');

    var duplicated = ctx.cb(questions);

    // quit early if questions are dedup
    // unless we are doing a full scan
    if (duplicated && !ctx.full)
      return onWorkerDone(ctx, 'duplicated questions found, quit now');
  }

  // push back failed page, thus try it later
  if (e) {
    ctx.pages.unshift(e.id);
    console.log('recollect failed page:' + e.id);
  }

  getPageWorker(ctx);
};

function getPageWorker(ctx) {
  // scan more pages if existing pages are all done
  if (ctx.pages.length === 0) {
    ctx.pages = _.range(ctx.nextPage, ctx.nextPage + 100);
    ctx.nextPage += 100;
  }

  var id = ctx.pages.shift();
  C3Service.getPage(id, ctx.wcb);
}

C3Service.update = function(cb) {
  var workers = parseInt(this.Stat.updated.workers);
  var ctx = {
    pages:    [],
    nextPage: 1,
    workers:  workers,
    cb:       cb,
    full:     this.Stat.updated.full
  };
  ctx.wcb = _.partial(onPageDone, ctx);

  for (var i = 0; i < workers; ++i) {
    getPageWorker(ctx);
  }
};

C3Service.getPage = function(id, cb) {
  console.log('getPage:' + id);
  this.$http.get('https://careercup.com/page?n=' + id)
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

      console.log('getPage:' + id, 'return ' + questions.length +' questions');
      return cb(null, questions);
    })
    .error(function(data,status, headers, config) {
      console.log('http error:' + status, data);
      return cb({id: id});
    });
};

angular.module('Services')
.service('C3', ['$http', 'Stat', function($http, Stat) {
  C3Service.$http = $http;
  C3Service.Stat = Stat;
  return C3Service;
}]);
