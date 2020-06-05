global.fetch = require('node-fetch');

global.prometheusHost = process.env.PROMETHEUS_HOST 
  || 'http://prometheus-now.monitoring:9090';

global.promFetch = (resource, init) => fetch(global.prometheusHost + resource, init);

// Good enough errors for test failure outputs
const err = (message, data) => {
  return "promValue failed: " + message + " " + JSON.stringify(data);
}

global.promValue = async query => {
  const req = promFetch(`/api/v1/query?query=${query}`);
  const json = await req.then(res => res.json());
  if (json.status != "success") return err("Expected status=success", json);
  const result = json.data.result;
  if (!result.length) return err("Empty result", json);
  if (result.length > 1) return err("Too many results", json);
  const value = result[0].value[1];
  if (isNaN(value)) return err("Not a number", value);
  return Number(value);
}
