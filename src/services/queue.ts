import { Injectable } from '@angular/core';
import * as _ from 'underscore';

@Injectable()
export class Queue {
  tasks: Array<any>;

  private ctx: any;
  private onTask: any;
  private onDone: any;
  private error: any;
  private concurrency = 0;
  private failed = 0;

  constructor(tasks, ctx, onTask) {
    this.tasks = _.clone(tasks) || [];
    this.ctx = ctx || {};
    this.onTask = onTask;
  }

  addTask(task) {
    this.tasks.push(task);
    return this;
  }

  addTasks(tasks) {
    this.tasks = this.tasks.concat(tasks);
    return this;
  }

  run(concurrency = 0, onDone = null) {
    this.concurrency = concurrency || this.tasks.length || 1;
    this.onDone = onDone;
    this.failed = 0;

    for (let i = 0; i < this.concurrency; ++i)
      setTimeout(() => this.workerRun(), 0);
  }

  workerRun() {
    // no more tasks, quit now
    if (this.tasks.length === 0) {
      if (--this.concurrency === 0 && this.onDone)
        this.onDone(this.error, this.ctx);
      return;
    }

    const task = this.tasks.shift();
    this.onTask(task, this, (e, retry) => {
      if (e) this.error = e;

      // delay a while if error occurs
      this.failed += retry ? 1 : -1;
      if (this.failed < 0) this.failed = 0;

      var delay = Math.min(this.failed * 2000, 60 * 1000);
      if (delay > 0) console.log('sleep ' + delay);

      setTimeout(() => this.workerRun(), delay);
    });
  }
}
