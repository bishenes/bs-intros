'use babel';

import fs from 'fs-plus'
import path from 'path'
import glob from 'glob'
import { CompositeDisposable } from 'atom';

let META_FILENAME = "manifest.json"

export default {

  activate(state) {
    console.log("bs-intros");
    this.copyIntros();
  },

  deactivate() {

  },

  serialize() {
    return { }
  },

  copyIntros() {

    console.log("copy intros");
    let id = "intros";
    let dir = path.join(process.env.ATOM_HOME, 'library', id);

    let manifestDir = path.join(dir, META_FILENAME);
    let manifest = {};
    if (fs.existsSync(manifestDir)) {
      manifest = JSON.parse(fs.readFileSync(manifestDir, 'utf8'));
    }
    
    if (manifest.installed) {
      console.log("intros installed");
      return
    }

    // init intros dir and write manifest
    if (!fs.existsSync(dir)) {
      fs.makeTreeSync(dir);
    }

    manifest.id = id;
    manifest.installed = true;
    manifest.displayName = atom.i18n.localize("Intros");
    manifest.ver = 1;


    let locale = atom.i18n.locale;
    let platform = "darwin";
    if(process.platform === 'win32'){
      platform = 'win32';
    }
    

    let copySrcPath = path.join(__dirname, "../assets/intros/en");
    if(locale && locale.startsWith("zh")){
      copySrcPath = path.join(__dirname, "../assets/intros/zh-cn")
    }

    console.log("start copy intros,  locale: " + locale + "  platform:" + platform + " src:" + copySrcPath);

    fs.copySync(copySrcPath, dir);

    let srcPaths = [];
    
    srcPaths = srcPaths.concat(glob.sync(path.join(dir, '*', platform ,'*.*')));

    srcPaths.forEach((srcPath)=>{
      let destPath = srcPath.replace(platform, ".");
      fs.copySync(srcPath, destPath);
    })
    fs.writeFileSync(manifestDir, JSON.stringify(manifest));
  }

};

