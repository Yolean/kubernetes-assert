# TODO public build, this is from ../ skaffold dev
FROM yolean/assert-runtime-nodejs:f49ff6965c13bf2484f722cd0a39a280f1746ede@sha256:c16f4b42e50c22a8d49806e4883aee17678aca163d259ca0022eacad9570f0cd

WORKDIR /usr/src/specs

COPY --chown=nonroot:nogroup package*.json .

RUN npm ci --ignore-scripts

COPY --chown=nonroot:nogroup . .
