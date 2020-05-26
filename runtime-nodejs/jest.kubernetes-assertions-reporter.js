// TODO a https://jestjs.io/docs/en/watch-plugins might be better suited to the task

console.log('Reporter loaded');

const http = require('http');

const client = require('prom-client');
const register = client.register;

const assertions_failed = new client.Counter({
  name: 'assertions_failed',
  help: 'inc\'d for every onTestResult numFailingTests',
});

const tests_total = new client.Counter({
  name: 'tests_total',
  help: 'inc\'d for every onRunComplete numTotalTests'
})

const test_suites_total = new client.Counter({
  name: 'test_suites_total',
  help: 'inc\'d for every onRunComplete numTotalTestSuites'
})

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
  }

  onRunStart() {
    //console.log('onRunStart', arguments);
  }
  
  onTestStart() {
    //console.log('onTestStart', arguments);
  }

  onRunComplete(contexts, results) {
    //console.log('onRunComplete', contexts, results);
    test_suites_total.inc(results.numTotalTestSuites);
    tests_total.inc(results.numTotalTests);
  }
  
  onTestResult(test, testResult, aggregatedResult) {
    assertions_failed.inc(testResult.numFailingTests);
    //console.log('onTestResult', testResult, aggregatedResult);
    if (!this._globalConfig.watch && !this._globalConfig.watchAll) {
      //console.log('Not a watch run. Exiting');
      server.stop();
    }
  }

}

module.exports = MetricsReporter;
