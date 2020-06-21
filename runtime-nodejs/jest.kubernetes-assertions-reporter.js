const fs = require('fs');
const http = require('http');

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 9091;
const RERUN_INTERVAL = parseInt(process.env.RERUN_INTERVAL);
const ASSERT_IS_DEV = process.env.ASSERT_IS_DEV === 'true';

const client = require('prom-client');
const register = client.register;

const assertions_failed = new client.Gauge({
  name: 'assertions_failed',
  help: 'current numFailingTests incrementally aggregated per run per path',
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

class SpecFilesTracker {

  constructor() {
    this._pathsSeen = {};
  }

  pathSeen(path, { numFailingTests }) {
    if (this._pathsSeen.hasOwnProperty(path)) {
      assertions_failed.inc(numFailingTests - this._pathsSeen[path].numFailingTests);
    } else {
      this._pathsSeen[path] = {};
      assert_files_seen.inc();
      assertions_failed.inc(numFailingTests);
      console.log('Path reported for the first time:', path);
    }
    this._pathsSeen[path].numFailingTests = numFailingTests;
  }

  modify(path) {
    const insignificant = '\n';
    fs.appendFile(path, insignificant, 'utf8', (err) => {
      if (err) throw err;
      console.log('Modified', path);
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

const tracker = new SpecFilesTracker();

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
class Reruns {

  constructor({ tracker, intervalMs }) {
    console.log('Activating reruns with interval (ms)', intervalMs);
    this._intervalMs = intervalMs;
    this._timeout = null;
  }

  onRunComplete() {
    this._timeout !== null && clearTimeout(this._timeout);
    if (!ASSERT_IS_DEV && RERUN_INTERVAL) {
      this._timeout = setTimeout(() => {
        tracker.modifyAll();
      }, this._intervalMs);
    }
  }

}

const reruns = new Reruns({
  tracker,
  intervalMs: RERUN_INTERVAL * 1000
});

class MetricsServer {

  constructor({ port, getMetrics }) {
    this.port = port;
    this.getMetrics = getMetrics;
  }

  serveMetrics(res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(this.getMetrics());
  }

  serveRerun(res) {
    console.log('Rerun endpoint called');
    tracker.modifyAll();
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('{}');
  }

  start() {
    this.server = http.createServer((req, res) => {
      //console.log('req', req.url, req.headers);
      if ('/metrics' == req.url) return this.serveMetrics(res);
      if ('POST' == req.method && '/rerun' == req.url) return this.serveRerun(res);
      res.writeHead(404, { 'Content-Length': '0' });
      res.end();
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
    // Can't change how Jest instantiates the reporter, so get this one from global
    this._tracker = tracker;
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
    let numFailedTests = 0;
    for (let i = 0; i < testResults.length; i++) {
      const { testFilePath, numFailingTests } = testResults[i];
      this._tracker.pathSeen(testFilePath, { numFailingTests });
      numFailedTests += numFailingTests;
    }
    test_suites_run.set(results.numTotalTestSuites);
    test_suites_run_total.inc(results.numTotalTestSuites);
    tests_run.set(results.numTotalTests);
    tests_run_total.inc(results.numTotalTests);
    assertions_failed_total.inc(results.numFailedTests);
    if (!this._globalConfig.watch && !this._globalConfig.watchAll) {
      //console.log('Not a watch run. Exiting');
      server.stop();
    }
    reruns.onRunComplete();
  }

}

module.exports = MetricsReporter;
