const fetch = require('node-fetch');

const prom = 'http://prometheus-now.monitoring:9090';

describe("node-exporter", () => {

  [
    'node_cpu_package_throttles_total',
    'node_cpu_core_throttles_total'
  ].forEach(metric => {
    it(`Has a metric ${metric}`, async () => {
      const meta = await fetch(`${prom}/api/v1/metadata?metric=${metric}`).then(res => res.json());
      expect(meta).toHaveProperty('data');
      expect(meta.data).toHaveProperty(metric);
    });
  });

});
