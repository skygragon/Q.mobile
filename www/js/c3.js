var C3Service = {};

C3Service.update = function(cb) {
  this.getPage(0, cb);
};

C3Service.getPage = function(id, cb) {
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

      return cb(questions);
    })
    .error(function(data,status, headers, config){
      // FIXME: retry it?
      alert('error'+status);
    });
};

angular.module('Services', [])
.service('C3', ['$http', '_', function($http, _) {
  C3Service.$http = $http;
  C3Service._ = _;
  return C3Service;
}]);
