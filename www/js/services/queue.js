function Queue(tasks, ctx, onTask) {
  this.tasks = _.clone(tasks) || [];
  this.ctx = ctx || {};
  this.onTask = onTask;
  this.error = null;
  this.failed = 0;
}

Queue.prototype.addTask = function(task) {
  this.tasks.push(task);
  return this;
};

Queue.prototype.addTasks = function(tasks) {
  this.tasks = this.tasks.concat(tasks);
  return this;
};

Queue.prototype.run = function(concurrency, onDone) {
  this.concurrency = concurrency || this.tasks.length || 1;
  this.onDone = onDone;
  this.failed = 0;

  const self = this;
  for (let i = 0; i < this.concurrency; ++i) {
    setTimeout(function() { self.workerRun(); }, 0);
  }
};

Queue.prototype.workerRun = function() {
  // no more tasks, quit now
  if (this.tasks.length === 0) {
    if (--this.concurrency === 0 && this.onDone)
      this.onDone(this.error, this.ctx);
    return;
  }

  const task = this.tasks.shift();
  const self = this;
  this.onTask(task, self, function(e, retry) {
    if (e) self.error = e;

    self.failed += retry ? 1 : -1;
    if (self.failed < 0) self.failed = 0;

    var delay = Math.min(self.failed * 2000, 60 * 1000);
    if (delay > 0) console.log('sleep ' + delay);
    setTimeout(function() { self.workerRun(); }, delay);
  });
};

angular.module('Services')
.service('Queue', [ function() {
  return Queue;
}]);
