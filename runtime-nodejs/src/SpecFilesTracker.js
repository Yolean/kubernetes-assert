const fs = require('fs');

module.exports = class SpecFilesTracker {

  constructor({ metrics }) {
    this._pathsSeen = {};
    this._metrics = metrics;
  }

  pathSeen(path, { numFailingTests }) {
    // eslint-disable-next-line no-prototype-builtins
    if (this._pathsSeen.hasOwnProperty(path)) {
      const delta = numFailingTests - this._pathsSeen[path].numFailingTests;
      if (delta > 0) this._metrics.assertions_failed.inc(delta);
      if (delta < 0) this._metrics.assertions_failed.dec(-delta);
    } else {
      this._pathsSeen[path] = {};
      this._metrics.assert_files_seen.inc();
      if (numFailingTests > 0) this._metrics.assertions_failed.inc(numFailingTests);
      console.log('Path reported for the first time:', path);
    }
    this._pathsSeen[path].numFailingTests = numFailingTests;
  }

  modify(path) {
    const insignificant = '\n';
    fs.appendFile(path, insignificant, 'utf8', (err) => {
      if (err) throw err;
      //console.log('Modified', path);
    });
  }

  modifyAll() {
    const modify = this.modify.bind(this);
    const paths = Object.keys(this._pathsSeen);
    console.log('Files will be modified to trigger rerun:', paths);
    paths.map(path => {
      // We prefer to do this as concurrent as possible, to trigger a single run, so don't wait
      modify(path);
    });
  }

}