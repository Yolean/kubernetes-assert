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
    // Can the client simply use the context's current namespace instead?
    const namespace = await fs.promises.readFile(`/run/secrets/kubernetes.io/serviceaccount/namespace`, 'utf8');
    expect(process.env.POD_NAMESPACE).toBeTruthy();
    expect(namespace).toEqual(process.env.POD_NAMESPACE);
    
    const pods = await k.listNamespacedPod(namespace);
    const names = pods.body.items.map(pod => pod.metadata.name);

    const podName = process.env.HOSTNAME;
    expect(names).toContain(podName);
  });

});
