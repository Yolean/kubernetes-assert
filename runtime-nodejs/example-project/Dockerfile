# TODO public build, this is from ../ skaffold dev
FROM builds-registry.ystack.svc.cluster.local/yolean/kubernetes-assert/runtime-nodejs:64e9e32e5776eb7082488fc144c967ae11aef802-dirty

WORKDIR /usr/src/specs

COPY --chown=nonroot:nogroup package*.json .

RUN npm ci --ignore-scripts

COPY --chown=nonroot:nogroup . .
