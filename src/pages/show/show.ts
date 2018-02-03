import { Component } from '@angular/core';
import { Clipboard } from '@ionic-native/clipboard';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import * as _ from 'underscore';

import { Config } from '../../models/config';

import { DB } from '../../services/db';
import { Fetcher } from '../../services/fetcher';
import { UI } from '../../services/ui';

@Component({
  selector: 'page-show',
  templateUrl: 'show.html'
})
export class ShowPage {
  static title = 'Question';
  static icon = 'paper';

  ctx: any;
  filter: any;
  tags: any;

  question: any;
  dirty = false;

  constructor(
    private clipboard: Clipboard,
    private iab: InAppBrowser,
    private db: DB,
    private fetcher: Fetcher,
    private ui: UI
  ) {
    this.ctx = Config.filtered;
    this.filter = Config.filter;
    this.tags = Config.tags;
    this.question = this.ctx.question;

    if (!this.question || this.filterChanged())
      this.showNext();
  }

  showNext(opts = {}) {
    return this.save()
      .then(saved => this.refreshFilter(this.question))
      .then(updated => this.selectAll())
      .then(ids => this.selectNext(ids, opts))
      .then(question => {
        if (question)
          this.fetcher.get().fixupQuestion(question);
        this.question = this.ctx.question = question;
        this.dirty = false;
      })
      .catch(e => {
        console.log(`failed get question: ${e}`)
        this.question = this.ctx.question = null;
        this.dirty = false;
      });
  }

  selectNext(ids, opts) {
    const n = ids.length;
    if (n === 0) return;

    var i = this.ctx.idx;
    if (this.filter.algo === 'Random') {
      i = _.random(n-1);
    } else {
      const step = opts.reversed ? -1 : 1;
      i = (i+step+n) % n;
    }
    this.ctx.idx = i;

    const id = ids[i];
    console.log('selected question id=' + id + ',' + i + '-th of ' + n);
    return this.db.getQuestion(id);
  }

  selectAll() {
    if (this.filterChanged()) {
      this.ctx.ids = [];
      this.ctx.idx = -1;
      this.ctx.filter = null;
    }
    if (this.ctx.filter) return this.ctx.ids;

    const filter = _.omit(this.filter, 'algo', 'reversed');
    return this.db.getQuestionsKeys(filter)
      .then(keys => {
        console.log(`filtered questions: ${keys.length}`);
        this.ctx.ids = keys.sort();
        this.ctx.filter = filter;
        return this.ctx.ids;
      });
  }

  filterChanged() {
    const f = this.ctx.filter;
    const fo = this.filter;
    return !f || f.status !== fo.status || f.level !== fo.level ||
      f.tag !== fo.tag || f.company !== fo.company;
  }

  filterMatch(question) {
    if (!question) return true;
    const f = this.ctx.filter;
    return f && +f.status >= question.status &&
      (f.company === '' || f.company === question.company) &&
      (f.tag === '' || question.tags.indexOf(f.tag) >= 0);
  }

  stars() {
    return _.range(this.question ? this.question.levelIndex : 0);
  }

  hasTag(t) {
    return this.question && this.question.tags.indexOf(t) >= 0;
  }

  flipTag(t) {
    const q = this.question;
    if (!q) return;

    if (this.hasTag(t)) {
      const i = q.tags.indexOf(t);
      if (i >= 0) q.tags.splice(i, 1);
    } else {
      q.tags.push(t);
    }
    this.dirty = true;
  }

  showTags() {
    const q = this.question;
    if (!q) return [];
    return _.difference(q.tags, this.tags);
  }

  save() {
    const q = this.question;
    if (!q || !this.dirty) return Promise.resolve(0);

    if (this.hasTag('Resolved')) q.status = 1;
    return this.db.updateQuestion(q, ['tags','status']);
  }

  refreshFilter(question) {
    if (this.filterMatch(question)) return false;
    const i = this.ctx.ids.indexOf(question.id);
    if (i >= 0) this.ctx.ids.splice(i, 1);
    return true;
  }

  open() {
    const opts = 'location=yes,toolbar=yes';
    const b = this.iab.create(this.question.link, '_blank', opts);
    b.show();
  }

  copy() {
    this.clipboard.copy(this.question.data);
    this.ui.showMessage('Copied to clipboard');
  }

  refresh() {
    const spin = this.ui.showLoading('Refreshing question ...');
    this.fetcher.get().getQuestion(this.question)
      .then(question => this.db.setQuestion(question))
      .then(q => spin.dismiss())
      .catch(e => {
        spin.dismiss();
        this.ui.showMessage(`Refresh failed: ${e}`);
      });
  }

  prev() {
    this.showNext({reversed: true});
  }

  next() {
    this.showNext();
  }
}
