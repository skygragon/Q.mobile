import { Injectable } from '@angular/core';

import { Config } from '../models/config';
import { Leetcode } from './leetcode';

@Injectable()
export class Fetcher {
  f: any;

  constructor(
    private leetcode: Leetcode
  ) {
    this.f = this.get();
  }

  get() {
    if (this.f) return this.f;

    let f;
    switch(Config.name) {
      case 'leetcode': f = this.leetcode; break;
      case 'lintcode': break;
      case 'careercup': break;
    }
    Config.dbkeys = f.dbkeys;
    Config.levels = f.levels;
    return f;
  }
}
