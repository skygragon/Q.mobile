import { Component } from '@angular/core';

import { Config } from '../../models/config';
import { FS } from '../../services/fs';

@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html'
})
export class SettingPage {
  static title = 'Setting';
  static icon = 'settings';

  config: any;

  constructor(
    public fs: FS
  ) {
    this.config = Config;
  }
}
