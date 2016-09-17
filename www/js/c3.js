var C3Service = {};

function onPage(ctx, e, questions) {
  if (questions) {
    if (questions.length === 0) {
      console.log('no more questions found, quit now');
      return;
    }
    var duplicated = ctx.cb(questions);

    // quit early if questions are dedup
    // unless we are doing a full scan
    if (duplicated && !ctx.full) {
      console.log('duplicated questions found, quit now');
      return;
    }
  }

  // push back failed page, thus try it later
  if (e) {
    ctx.pages.unshift(e.id);
    console.log('collect failed page:' + e.id);
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
  var ctx = {
    pages: [],
    nextPage: 1,
    cb: cb,
    full: this.Stat.update.full
  };
  ctx.wcb = _.partial(onPage, ctx);

  for (var i = 0; i < 10; ++i) {
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
            rand: Math.random()
          };
          _.each(x.getElementsByTagName('span'), function(x) {
            switch(x.className) {
              case 'entry':
                var a = x.getElementsByTagName('a')[0];
                q.link = a.attributes['href'].value;
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
          q.link = 'http://careercup.com/' + _.last(q.link.split('/'));
          q.name = _.last(q.link.split('id='));

          return q;
        })
        .value();

      console.log('getPage:' + id + ' = ' + questions.length);
      return cb(null, questions);
    })
    .error(function(data,status, headers, config) {
      return cb({id: id});
    });
};

angular.module('Services')
.service('C3', ['$http', '_', 'Stat', function($http, _, Stat) {
  C3Service.$http = $http;
  C3Service._ = _;
  C3Service.Stat = Stat;
  return C3Service;
}]);
