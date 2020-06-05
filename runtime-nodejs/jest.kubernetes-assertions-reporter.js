// TODO a https://jestjs.io/docs/en/watch-plugins might be better suited to the task

console.log('Reporter loaded');

const http = require('http');

const client = require('prom-client');
const register = client.register;

const assertions_failed = new client.Gauge({
  name: 'assertions_failed',
  help: 'current onTestResult numFailingTests',
});

const assertions_failed_total = new client.Counter({
  name: 'assertions_failed_total',
  help: 'inc\'d for every onTestResult numFailingTests',
});

const tests_run = new client.Gauge({
  name: 'tests_run',
  help: 'current onRunComplete numTotalTests'
});

const tests_run_total = new client.Counter({
  name: 'tests_run_total',
  help: 'inc\'d for every onRunComplete numTotalTests'
});

const test_suites_run = new client.Gauge({
  name: 'test_suites_run',
  help: 'current onRunComplete numTotalTestSuites'
});

const test_suites_run_total = new client.Counter({
  name: 'test_suites_run_total',
  help: 'inc\'d for every onRunComplete numTotalTestSuites'
});

const assert_files_seen = new client.Gauge({
  name: 'assert_files_seen',
  help: 'Unique spec file paths that have been seen in onTestResult'
});

const assert_completions_passed = new client.Gauge({
  name: 'assert_completions_passed',
  help: 'Gets a value if a spec names assert-completion.spec.js has run'
});

const assert_completions_remaining = new client.Gauge({
  name: 'assert_completions_remaining',
  help: 'The number of failures for assert-completion.spec.js (pending and todo are ignored)'
});

class MetricsServer {

  constructor({ port, getMetrics }) {
    console.log('metrics server init', port, typeof getMetrics);
    this.port = port;
    this.getMetrics = getMetrics;
  }

  start() {
    const getMetrics = this.getMetrics;
    this.server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(getMetrics());
    });
    this.server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    this.server.listen(this.port, '0.0.0.0');
  }

  stop() {
    this.server.close();
  }

}

const server = new MetricsServer({
  port: 9090,
  getMetrics: () => register.metrics()
});

server.start();

class MetricsReporter {

  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    this._pathsSeen = {};
  }

  onRunStart() {
    //console.log('onRunStart', arguments);
  }
  
  onTestStart() {
    //console.log('onTestStart', arguments);
  }

  onRunComplete(contexts, results) {
    //console.log('onRunComplete', contexts, results);
    test_suites_run.set(results.numTotalTestSuites);
    test_suites_run_total.inc(results.numTotalTestSuites);
    tests_run.set(results.numTotalTests);
    tests_run_total.inc(results.numTotalTests);
    assertions_failed.set(results.numFailedTests);
    assertions_failed_total.inc(results.numFailedTests);
    if (!this._globalConfig.watch && !this._globalConfig.watchAll) {
      //console.log('Not a watch run. Exiting');
      server.stop();
    }
  }

  onTestResult(test, testResult, aggregatedResult) {
    //console.log('onTestResult', testResult);
    const path = testResult.testFilePath;
    if (!this._pathsSeen[path]) {
      this._pathsSeen[path] = {};
      assert_files_seen.inc(1);
    }
    if (this.isAssertCompletion(path)) {
      this.onAssertCompletion(testResult);
    }
  }

  isAssertCompletion(testFilePath) {
    const match = /.*\/assert-completion\.spec\.js$/.test(testFilePath);
    return match;
  }

  onAssertCompletion(testResult) {
    assert_completions_passed.set(testResult.numPassingTests);
    assert_completions_remaining.set(testResult.numFailingTests);
  }

}

module.exports = MetricsReporter;
