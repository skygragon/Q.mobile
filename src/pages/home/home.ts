import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Network } from '@ionic-native/network';

import { ShowPage } from '../../pages/show/show';
import { Config } from '../../models/config';
import { DB } from '../../services/db';
import { Fetcher } from '../../services/fetcher';
import { Queue } from '../../services/queue';
import { UI } from '../../services/ui';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  static title = 'Dashboard';
  static icon = 'pulse';

  count: any;
  updated: any;
  config: any;

  todayTag = '';
  todayCount = 0;

  constructor(
    private navCtrl: NavController,
    private network: Network,
    private db: DB,
    private fetcher: Fetcher,
    private ui: UI
  ) {
    this.count = Config.questions;
    this.updated = Config.updated;
    this.config = Config;

    this.refresh();
  }

  refreshTag(tag, cb) {
    this.db.countQuestions(tag)
      .then(n => {
        this.count[tag || 'Total'] = n;
        return cb();
      });
  }

  refresh() {
    const q = new Queue(Config.tags, null, (tag, queue, cb) => this.refreshTag(tag, cb));
    q.addTask('');
    q.run(0, () => {
      this.count.Unresolved = this.count.Total - this.count.Resolved;
      this.todayTag = this.config.dashboard.todayTag;
      this.todayCount = this.count[this.todayTag];
    });
  }

  update() {
    if (this.updated.updating) return;
    if (this.network.type !== 'wifi' && Config.updated.wifiOnly)
      return this.ui.showMessage('Need WiFi connection!');

    this.updated.updating = true;
    this.fetcher.get().update()
      .then(() => {
        this.updated.updating = false;
        this.refresh();

        this.updated.questions = 0;
        this.updated.pages = 0;
        this.updated.new = 0;
      });
  }

  show(tag) {
    const f = this.config.filter;
    f.tag = tag;
    f.company = '';
    f.level = 'All';
    f.status = '1';
    this.navCtrl.setRoot(ShowPage);
  }
}
