import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';

import { Config } from '../models/config';
import { DB } from './db';

@Injectable()
export class FS {
  private dir: string;
  private name: string;

  constructor(
    private file: File,
    private db: DB
  ) {}

  checkDir() {
    if (this.dir) return;
    try {
      this.dir = this.file.externalRootDirectory ||
                 this.file.externalDataDirectory ||
                 this.file.dataDirectory;
    } catch (e) {
      // FIXME: hack web test where no cordova defined...
      console.log(e.message);
    }
    this.dir = this.dir || './';
    this.name = Config.name + '.json';
  }

  filepath() {
    this.checkDir();
    return this.dir + this.name;
  }

  save() {
    this.checkDir();
    return this.db.getQuestions()
      .then(questions => this.file.writeFile(this.dir, this.name, JSON.stringify(questions), {replace: true}))
      .then(ok => this.filepath());
  }

  load() {
    this.checkDir();
    return this.file.readAsText(this.dir, this.name)
      .then(data => this.db.setQuestions(JSON.parse(data)));
  }
}
