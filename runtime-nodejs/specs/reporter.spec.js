//const reporter = require('../jest.kubernetes-assertions-reporter.js');

describe("MetricsReporter", () => {
  
  // TODO fix port conflict with the actual reporter while running,
  // or find a way to mock server
  xit("Exists, but it starts a server as soon as it's required here", () => {
    expect(reporter).toBeDefined();
  });

});
