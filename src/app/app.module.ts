import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HTTP } from '@ionic-native/http';
import { Clipboard } from '@ionic-native/clipboard';
import { File } from '@ionic-native/file';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Network } from '@ionic-native/network';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ShowPage } from '../pages/show/show';
import { SettingPage } from '../pages/setting/setting';

import { DB } from '../services/db';
import { FS } from '../services/fs';
import { Leetcode } from '../services/leetcode';
import { Fetcher } from '../services/fetcher';
import { UI } from '../services/ui';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ShowPage,
    SettingPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ShowPage,
    SettingPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Clipboard,
    File,
    InAppBrowser,
    Network,
    HTTP,
    DB,
    FS,
    Leetcode,
    Fetcher,
    UI,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
