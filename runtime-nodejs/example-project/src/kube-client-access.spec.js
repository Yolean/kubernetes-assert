const fs = require('fs');
const k8s = require('@kubernetes/client-node');

describe("Kubernets client (nodejs)", () => {

  let k;

  beforeAll(() => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    k = kc.makeApiClient(k8s.CoreV1Api);
  });

  it("Can list pods", async () => {
    // What's a simple way to use current namespace?
    const namespace = await fs.promises.readFile(`/run/secrets/kubernetes.io/serviceaccount/namespace`, 'utf8');
    
    const pods = await k.listNamespacedPod(namespace);
    const names = pods.body.items.map(pod => pod.metadata.name);

    const podName = process.env.HOSTNAME;
    expect(names).toContain(podName);
  });

});
