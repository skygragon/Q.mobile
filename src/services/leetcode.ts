import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';

import * as _ from 'underscore';
import * as he from 'he';

import { Config } from '../models/config';
import { DB } from './db';
import { Queue } from './queue';

@Injectable()
export class Leetcode {
  levels = ['All', 'Easy', 'Medium', 'Hard'];
  dbkeys = ['accepts', 'data', 'id', 'key', 'level', 'locked', 'status', 'submits', 'tags', 'title']

  constructor(
    private http: HTTP,
    private db: DB
  ) {}

  update() {
    return this.http.get('https://leetcode.com/api/problems/algorithms/', {}, {})
      .then(res => this.parseQuestions(JSON.parse(res.data)))
      .then(questions => this.filterQuestions(questions))
      .then(questions => this.getQuestions(questions))
      .catch(e => console.log(`✘ getQuestions: ${e}`));
  }

  filterQuestions(questions) {
    if (Config.updated.fully)
      return questions;
    else
      return this.db.getQuestionsKeys()
        .then(keys => _.reject(questions, q => keys.indexOf(q.id) >= 0));
  }

  getQuestions(questions) {
    console.log(`start getting ${questions.length} questions`);
    const queue = new Queue(questions, null, (question, q, cb) => {
      this.getQuestion(question)
        .then(question => {
          ++Config.updated.questions;
          return this.db.setQuestion(question)
        })
        .then(exist => {
          if (!exist) ++Config.updated.new;
          return cb();
        })
        .catch(e => {
          console.log(`✘ getQuestion=${question.id}, error=${e}`);
          q.addTask(question);
          console.log(`recollect failed question=${question.id}`);
          return cb(null, e);
        });
    });

    return new Promise<any>(resolve => {
      const n = parseInt(Config.updated.workers);
      queue.run(n, resolve);
    });
  }

  getQuestion(question) {
    console.log(`start getQuestion=${question.id}`);
    if (question.locked) {
      // TODO: show locked?
      console.log(`skip locked question=${question.id}`);
      question.data = 'Question Locked';
      question.tags = [];
      return Promise.resolve(question);
    }

    return this.http.get(question.link, {}, {})
      .then(res => this.parseQuestion(question, res.data));
  }

  parseQuestions(json) {
    const questions = _.chain(json.stat_status_pairs)
        .filter(function(p) { return !p.stat.question__hide; })
        .map(function(p) {
          return {
            status:  0,
            id:      p.stat.question_id,
            title:   p.stat.question__title,
            key:     p.stat.question__title_slug,
            link:    'https://leetcode.com/problems/' + p.stat.question__title_slug,
            locked:  p.paid_only,
            accepts: p.stat.total_acs,
            submits: p.stat.total_submitted,
            level:   p.difficulty.level
          };
        })
        .value();
    return questions;
  }

  parseQuestion(question, body) {
    ++Config.updated.pages;
    var parser = new DOMParser();
    var doc = parser.parseFromString(body, 'text/html');

    _.each(doc.getElementsByTagName('meta'), meta => {
      if (meta.attributes['name'] &&
          meta.attributes['name'].value === 'description') {
        question.data = meta.attributes['content'].value;
      }
    });

    var r = /(var pageData[^;]+;)/m;
    var result = body.match(r);
    if (!result) {
      question.locked = true;
      question.data = 'Question Locked';
      question.tags = [];
    }

    console.log(`✔ getQuestion=${question.id}`);
    return question;
  }

  fixupQuestion(q) {
    q.data = he.decode(q.data);
    q.link = 'https://leetcode.com/problems/' + q.key;
    q.levelName = this.levels[q.level];
    q.levelIndex = q.level;
    if (q.submits) q.rate = q.accepts * 100 / q.submits;
    if (!q.tags) q.tags = [];
  };
}
/*
      // if hit duplicate, skip those questions before this one
      // unless user wants a full scan
      if (q.ctx.cb([question]) && !q.ctx.fully) {
        console.log('Find duplicated on question=' + question.id);
        q.tasks = _.reject(q.tasks, function(x) {
          return x.id <= question.id;
        });
      }
*/
