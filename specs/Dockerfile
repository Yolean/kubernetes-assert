FROM yolean/assert-runtime-nodejs:d3630d89f1babc4a17f95e89a249030b8b501043@sha256:cb4ce7cddce3230420ae963c2ec5718b68254f98a8a00b6a0879d2aa672b9b56

WORKDIR /usr/src/specs

COPY --chown=nonroot:nogroup package*.json ./

RUN npm ci --ignore-scripts

COPY --chown=nonroot:nogroup . .
