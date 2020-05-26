# TODO public build, this is from ../ skaffold dev
FROM builds-registry.ystack.svc.cluster.local/yolean/kubernetes-assert/runtime-nodejs:3db548aed2ab8ecd32c49d781bec8a76699615f8-dirty

WORKDIR /usr/src/specs

COPY package*.json .

RUN npm ci --ignore-scripts

COPY . .
