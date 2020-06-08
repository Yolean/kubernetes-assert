// TODO a https://jestjs.io/docs/en/watch-plugins might be better suited to the task

console.log('Assert reporter loaded, see github.com/Yolean/kubernetes-assert');

const http = require('http');

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 9091;

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

class MetricsServer {

  constructor({ port, getMetrics }) {
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
    console.log('Server listening on port', this.port);
  }

  stop() {
    this.server.close();
  }

}

const server = new MetricsServer({
  port: PORT,
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
      assert_files_seen.inc();
    }
  }

}

module.exports = MetricsReporter;
