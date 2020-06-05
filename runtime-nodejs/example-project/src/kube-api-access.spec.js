const fs = require('fs');
const { Certificate } = require('@fidm/x509');

const credspath = '/run/secrets/kubernetes.io/serviceaccount';

describe("kube api access", () => {

  it("Uses a library in this project's package.json", () => {
    expect(Certificate).toBeDefined();
  });

  it("Can locate the pod's mounted ca", async () => {
    const crt = await fs.promises.readFile(`${credspath}/ca.crt`);
    const ca = Certificate.fromPEM(crt);
    expect(ca).toHaveProperty('publicKey');
  });

  it("Can read pod's mounted bearer token", async () => {
    const token = await fs.promises.readFile(`${credspath}/token`, 'utf8');
    expect(token).toMatch(/.+/);
  });

});
