var C3 = {
  dbkeys: [
    'company',
    'data',
    'id',
    'status',
    'tags',
    'time'
  ]
};

function onC3PageTask(id, q, cb) {
  var ctx = q.ctx;
  // linear timeout on retry, 90 seconds at most
  var opts = {timeout: Math.min((ctx.failed[id] || 1) * 5000, 90 * 1000)};

  C3.getPage(id, opts, function(e, questions) {
    // scan more pages if existing pages are all done
    if (q.tasks.length === 0 && ctx.end === -1) {
      q.addTasks(_.range(ctx.next, ctx.next + 50));
      ctx.next += 50;
    }

    if (e) {
      ctx.failed[id] = (ctx.failed[id] || 0) + 1;
      q.addTask(id);
      console.log('recollect failed page:' + id);
      return cb();
    }
    delete ctx.failed[id];

    // if hit duplicate, skip further pages unless user wants a full scan
    if (questions.length === 0 || (ctx.cb(questions) && !ctx.fully)) {
      if (ctx.end === -1) ctx.end = id;
      q.tasks = _.reject(q.tasks, function(x) {
        return x >= id;
      });
    }
    return cb(null, e);
  });
}

C3.update = function(cb) {
  var n = parseInt(this.Stat.updated.workers);

  var ctx = {
    cb:     cb,
    fully:  this.Stat.updated.fully,
    next:   n,
    end:    -1,
    failed: {}
  };
  var q = new this.Queue(_.range(n), ctx, onC3PageTask);
  q.run(n, function(e, ctx) {
    return cb();
  });
};

C3.getPage = function(id, opts, cb) {
  console.log('start getPage=' + id + ', timeout=' + opts.timeout);
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
                q.id = parseInt(_.last(a.attributes['href'].value.split('id=')));
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
      return cb(null, questions);
    })
    .error(function(data, status, headers, config) {
      console.log('✘ getPage=' + id + ', error=' + status + '/' + data + ', timeout=' + opts.timeout);
      return cb(status);
    });
};

C3.fixupQuestion = function(question) {
  question.link = 'https://careercup.com/question?id=' + question.id;
  question.data = he.decode(question.data);
};

angular.module('Services')
.service('C3', ['$http', 'Stat', 'Queue', function($http, Stat, Queue) {
  C3.$http = $http;
  C3.Stat = Stat;
  C3.Queue = Queue;
  return C3;
}]);
