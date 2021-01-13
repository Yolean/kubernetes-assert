
/*
 * The idea ...
 * We'll only get good specs if the development experience is attractive
 * which is why runtime-nodejs prioritizes the use case skaffold dev with sync
 * Until https://github.com/facebook/jest/issues/5048 https://github.com/facebook/jest/issues/8868 are fixed
 * ... or we want to give something like https://medium.com/web-developers-path/how-to-run-jest-programmatically-in-node-js-jest-javascript-api-492a8bc250de a try
 * ... or we find a way to emulate interactive watch keypresses
 * it'll mean that we run watch always and that the unattended run mode will be a bit of a hack
 * The basic requirement is that tests are rerun.
 * We rerun all tests, not only failed, because when it comes to infra things go up and down.
 */
module.exports = class Reruns {

  constructor({ tracker, rerunWaitMs, assertIsDev, requiredSuccessions = 3 }) {
    console.log('Activating reruns with interval (ms)', rerunWaitMs);
    this._rerunWaitMs = rerunWaitMs;
    this._timeout = null;
    this._tracker = tracker;
    this._assertIsDev = assertIsDev;
    this._requiredSuccessions = requiredSuccessions;

    this._state = { successions: 0 };
  }

  onRunComplete(contexts, results) {
    if (results.numFailedTests === 0) this._state.successions++;
    else this._state.successions = 0;

    this._timeout !== null && clearTimeout(this._timeout);

    if (this._state.successions > this._requiredSuccessions) return;

    if (!this._assertIsDev && this._rerunWaitMs) {
      this._timeout = setTimeout(() => {
        this._tracker.modifyAll();
      }, this._rerunWaitMs);
    }
  }

}