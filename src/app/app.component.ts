import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ShowPage } from '../pages/show/show';
import { SettingPage } from '../pages/setting/setting';

import { Config } from '../models/config';
import { FS } from '../services/fs';
import { UI } from '../services/ui';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  pages: Array<any>;
  rootPage: any = HomePage;
  config: any;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private fs: FS,
    private ui: UI
  ) {
    this.config = Config;
    this.initializeApp();
    this.pages = [HomePage, ShowPage, SettingPage];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page);
  }

  backup() {
    this.fs.save()
      .then(
        f => this.ui.showMessage(`Successfully backup to ${f}`),
        e => this.ui.showMessage(`Backup failed: ${e.message}`)
      );
  }

  restore() {
    this.fs.load()
      .then(
        n => this.ui.showMessage(`Successfully restored ${n} questions`),
        e => this.ui.showMessage(`Restore failed: ${e.message}`)
      );
  }
}
