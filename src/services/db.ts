import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import * as _ from 'underscore';

import { Config } from '../models/config';

@Injectable()
export class DB {
  private db: any;
  private ctx: any;

  constructor() {
    this.ctx = Config.filtered;

    this.db = new Dexie(Config.name + '.db');
    this.db.version(1).stores({
      questions: '++id,&name,status,company,*tags'
    });
    this.db.version(2).stores({
      questions: '++id,status,company,*tags'
    }).upgrade(() => {
      console.log('found new schema v2!');
      setTimeout(() => this.upgrade(), 0);
    });
  }

  upgrade() {
    console.log('upgrading to v2 ...');
    return this.getQuestions()
      .then(questions => {
        questions.forEach(q => {
          q.id = q.name;
          delete q.name;
        });
        return this.setQuestions(questions);
      })
      .then(n => console.log('upgraded to v2!'))
      .catch(e => console.log('upgrade failed:' + e.stack));
  }

  getQuestion(id) {
    return this.db.questions.get(id);
  }

  setQuestion(question) {
    question = _.pick(question, Config.dbkeys);
    return this.getQuestion(question.id)
      .then(q => {
        if (q) {
          const tags = _.union(q.tags, question.tags);
          question = _.omit(question, 'status', 'tags');
          question = _.extendOwn(q, question);
          question.tags = tags;
        }
        return this.db.questions.put(question)
          .then(key => q);
      });
  }

  updateQuestion(question, keys) {
    const data = _.pick(question, keys);
    return this.db.questions.update(question.id, data);
  }

  filterQuestions(filter: any = {}) {
    console.log(JSON.stringify(filter));
    let questions = this.db.questions;

    if (Number.isInteger(+filter.status))
      questions = questions.where('status').belowOrEqual(+filter.status);
    else
      questions = questions.toCollection();

    if (filter.tag)
      questions.and(q => q.tags && q.tags.indexOf(filter.tag) >= 0);

    if (filter.company)
      questions.and(q => q.company === filter.company);

    if (filter.level && filter.level !== 'All') {
      const level = Config.levels.indexOf(filter.level)
      questions.and(q => q.level === level);
    }

    return questions;
  }

  getQuestions(filter: any = {}) {
    return this.filterQuestions(filter).toArray();
  }

  getQuestionsKeys(filter: any = {}) {
    return this.filterQuestions(filter).primaryKeys();
  }

  countQuestions(tag) {
    let questions = this.db.questions;
    if (tag && tag !== '') {
      questions = questions.where('tags').anyOf([tag]);
    } else {
      questions = questions.toCollection();
    }
    return questions.count();
  };

  setQuestions(questions) {
    questions = questions.map(q => _.pick(q, Config.dbkeys));
    return this.db.questions
      .clear()
      .then(() => this.db.questions.bulkPut(questions))
      .then(() => questions.length);
  }
}
