'use babel';

import fs from 'fs-plus'
import path from 'path'
import { CompositeDisposable } from 'atom';

let META_FILENAME = "manifest.json"

export default {

  activate(state) {
    this.copyIntros();
  },

  deactivate() {

  },

  serialize() {
    return { }
  },

  copyIntros() {

    let id = "intros";
    let dir = path.join(process.env.ATOM_HOME, 'library', id);


    let manifestDir = path.join(dir, META_FILENAME);
    let manifest = {};
    if (fs.existsSync(manifestDir)) {
      manifest = JSON.parse(fs.readFileSync(manifestDir, 'utf8'));
    }
    if (manifest.installed) {
      return
    }

    // init intros dir and write manifest
    if (!fs.existsSync(dir)) {
      fs.makeTreeSync(dir);
    }

    manifest.id = id;
    manifest.installed = true;
    manifest.displayName = "使用说明";
    manifest.ver = 1;

    fs.copySync(path.join(__dirname, "../assets/intros/zh-cn"), dir);
    fs.writeFileSync(manifestDir, JSON.stringify(manifest));
  }

};

