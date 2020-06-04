const fetch = require('node-fetch');

describe('The Prometheus "now" instance', () => {

  it("Is accessible at prometheus-now.monitoring", async () => {
    const root = await fetch('http://prometheus-now.monitoring:9090/').then(res => res.text());
    expect(root).toMatch(/Prometheus Time Series Collection and Processing Server/);
  });

});
