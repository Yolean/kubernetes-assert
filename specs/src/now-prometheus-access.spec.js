const fetch = require('node-fetch');

describe('Prometheus "now"', () => {

  it("Is accessible at prometheus-now.monitoring:9090", async () => {
    const root = await fetch('http://prometheus-now.monitoring:9090/').then(res => res.text());
    expect(root).toMatch(/Prometheus Time Series Collection and Processing Server/);
  });

  it("Has an alertmanager", async () => {
    const alertmanagers = await fetch('http://prometheus-now.monitoring:9090/api/v1/alertmanagers').then(res => res.json());
    expect(alertmanagers.data.activeAlertmanagers.length).toBeGreaterThanOrEqual(1);
  });

});
