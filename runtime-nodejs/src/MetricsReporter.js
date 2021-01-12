module.exports = class MetricsReporter {

  constructor({ tracker, isWatching, metrics, server, reruns }) {
    this._tracker = tracker;
    this._isWatching = isWatching;
    this._metrics = metrics;
    this._server = server;
    this._reruns = reruns;
  }

  onRunStart() {
    //console.log('onRunStart', arguments);
  }

  onTestStart() {
    //console.log('onTestStart', arguments);
  }

  onRunComplete(contexts, results) {
    //console.log('onRunComplete', contexts, results);
    const { testResults } = results;
    for (let i = 0; i < testResults.length; i++) {
      const { testFilePath, numFailingTests } = testResults[i];
      this._tracker.pathSeen(testFilePath, { numFailingTests });
    }
    this._metrics.test_suites_run.set(results.numTotalTestSuites);
    this._metrics.test_suites_run_total.inc(results.numTotalTestSuites);
    this._metrics.tests_run.set(results.numTotalTests);
    this._metrics.tests_run_total.inc(results.numTotalTests);
    this._metrics.assertions_failed_total.inc(results.numFailedTests);
    if (!this._isWatching) {
      //console.log('Not a watch run. Exiting');
      this._server.stop();
    }
    this._reruns.onRunComplete();
  }

}