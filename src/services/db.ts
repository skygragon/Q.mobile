import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import * as _ from 'underscore';

import { Config } from '../models/config';

@Injectable()
export class DB {
  private db: any;
  private ctx: any;
  private upgrading = false;

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
      this.upgrading = true;
    });
  }

  open() {
    return this.db.open()
      .then(db => this.upgrade(db))
      .catch(e => console.log('db open failed:', e.stack));
  }

  upgrade(db) {
    this.db = db;
    if (!this.upgrading) return Promise.resolve(db);
    /*
    console.log('upgrading to v2 ...');
    return this.getQuestions()
      .then(function(questions) {
        questions.forEach(function(q) {
          q.id = q.name;
          delete q.name;
        });
        return DB.setQuestions(questions);
      })
      .then(function(e) {
        if (e) {
          console.log('failed to upgrade v2: ' + e.message);
        } else {
          console.log('upgraded to v2!');
          DB.toV2 = false;
        }
        return cb();
      });*/
  }

  getQuestion(id) {
    return this.db.questions.get(id);
  }

  setQuestion(question) {
    question = _.pick(question, Config.dbkeys);
    return this.getQuestion(question.id)
      .then(q => {
        if (q) {
          question = _.omit(question, 'status', 'tags');
          question = _.extendOwn(q, question);
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
