const fetch = require('node-fetch');

describe("A sub-module", () => {

  it("Can use the runtime's default dependencies", () => {
    expect(fetch).toBeDefined();
  });

  it("Gets the metrics reporter despite having its own package.json", async () => {
    const metrics = await fetch('http://localhost:9090/metrics').then(res => res.text());
    expect(metrics).toMatch(/\bassertions_failed /);
  });

  it("Exports results not only to localhost", async () => {
    expect(process.env.POD_IP).toBeTruthy();
    const metrics = await fetch(`http://${process.env.POD_IP}:9090/metrics`).then(res => res.text());
    expect(metrics).toMatch(/\bassertions_failed /);
    expect(metrics).toMatch(/\btests_run /);
  });

});
