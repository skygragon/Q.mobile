StatService = {
  tags: ['Resolved','Later','Favorite'],
  data: {all: 0},
  ctx: {tasks: 0, dirty: true}
};

StatService.init = function(DB) {
  this.DB = DB;

  var self = this;
  this.tags.forEach(function(tag) {
    self.data[tag] = 0;
  });
};

StatService.query = function(tag) {
  ++this.ctx.tasks;

  var self = this;
  this.DB.countQuestions(tag, function(count) {
    self.data[tag] = count;
    self.onTaskDone();
  });
};

StatService.onTaskDone = function() {
  this.ctx.dirty = false;
  if (--this.ctx.tasks === 0 && this.ctx.cb) {
    this.ctx.cb();
  }
};

StatService.refresh = function(cb) {
  this.ctx.cb = cb;
  this.query('all');

  var self = this;
  this.tags.forEach(function(tag) {
    self.query(tag);
  });
};

angular.module('Services')
.service('Stat', [ 'DB', function(DB) {
  StatService.init(DB);
  return StatService;
}]);
