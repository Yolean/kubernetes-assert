const fetch = require('node-fetch');

describe('Alertmanager "main"', () => {

  it("Is accessible on alertmanager-main.monitoring:9093", async () => {
    const root = await fetch('http://alertmanager-main.monitoring:9093/').then(res => res.text());
    expect(root).toMatch(/Alertmanager/);
  });

  it("It reports status", async () => {
    const status = await fetch('http://alertmanager-main.monitoring:9093/api/v2/status').then(res => res.json());
    expect(status.cluster.peers.length).toBeGreaterThanOrEqual(1);
  });

  it("Can list alerts", async () => {
    const alerts = await fetch('http://alertmanager-main.monitoring:9093/api/v2/alerts').then(res => res.json());
    expect(alerts).toBeInstanceOf(Array);
  });

});
