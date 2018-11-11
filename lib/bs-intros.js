'use babel';

import fs from 'fs-plus'
import path from 'path'
import glob from 'glob'
import { CompositeDisposable } from 'atom';

import uuidv4 from 'uuid/v4';

let META_FILENAME = "manifest.json"

export default {

  activate(state) {

    this.disposables = new CompositeDisposable()
    this.disposables.add(atom.commands.add('atom-workspace', {
        'bs-intros:init-demos': () => this.initDemos(),
    }))

    console.log("bs-intros");
    this.copyIntros();
  },

  deactivate() {

  },

  serialize() {
    return {}
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
    if (process.platform === 'win32') {
      platform = 'win32';
    }


    let copySrcPath = path.join(__dirname, "../assets/intros/en");
    if (locale && locale.startsWith("zh")) {
      copySrcPath = path.join(__dirname, "../assets/intros/zh-cn")
    }

    console.log("start copy intros,  locale: " + locale + "  platform:" + platform + " src:" + copySrcPath);

    fs.copySync(copySrcPath, dir);

    let srcPaths = [];

    srcPaths = srcPaths.concat(glob.sync(path.join(dir, '*', platform, '*.*')));

    srcPaths.forEach((srcPath) => {
      let destPath = srcPath.replace(platform, ".");
      fs.copyFileSync(srcPath, destPath);
    })
    fs.writeFileSync(manifestDir, JSON.stringify(manifest));
  },

  async initDemos() {
    await this.__loadDemo('demo-1zw');
    await this.__loadDemo('demo-2ww');
    await this.__loadDemo('demo-3gw');
    atom.docRepo.emitter.emit('did-library-change', { libraries: ["books"] });
  },

  async __loadDemo(name) {
    if (atom.docRepo) {
      let srcPath = path.join(__dirname, `../assets/demos/${name}`);
      let data = fs.readFileSync(path.join(srcPath, "manifest.json"))
      let book = JSON.parse(data);
  
      if (Array.isArray(book.chapters)) {
        let chapters = book.chapters;
        // give a unique id for demos
        book = { libraryId: "books", id: uuidv4().split("-").join(""), name: book.displayName, cateName: "" }
        await atom.docRepo.dbProvider.saveNewBook(book.id, book, 0);
        atom.docRepo.notifyBookCreated([atom.docRepo.userUUID, book.libraryId, book.id].join('/'), book.id, book.name, book.cateName);
        for (let doc of chapters){
          let content = fs.readFileSync(path.join(srcPath, doc.id + '.ot'))
          await atom.docRepo.newChapter(book, content);
        }
      }
    }
  }
}