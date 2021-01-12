const PORT = process.env.PORT ? parseInt(process.env.PORT) : 9091;
const RERUN_WAIT = parseInt(process.env.RERUN_WAIT);
const ASSERT_IS_DEV = process.env.ASSERT_IS_DEV === 'true';

const client = require('prom-client');
const MetricsReporter = require('./src/MetricsReporter');
const MetricsServer = require('./src/MetricsServer');
const Reruns = require('./src/Reruns');
const SpecFilesTracker = require('./src/SpecFilesTracker');
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

const tracker = new SpecFilesTracker();

const reruns = new Reruns({
  tracker,
  rerunWaitMs: RERUN_WAIT * 1000,
  assertIsDev: ASSERT_IS_DEV
});

const server = new MetricsServer({
  port: PORT,
  getMetrics: () => register.metrics(),
  tracker
});

server.start();

module.exports = function (globalConfig, options) {
  return new MetricsReporter({
    isWatching: !globalConfig.watch && !globalConfig.watchAll,
    tracker,
    metrics: {
      assertions_failed,
      assertions_failed_total,
      tests_run,
      tests_run_total,
      test_suites_run,
      test_suites_run_total,
      assert_files_seen,
    },
    reruns,
    server
  })
};
