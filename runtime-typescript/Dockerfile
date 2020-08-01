FROM yolean/assert-runtime-nodejs

COPY --chown=nonroot:nogroup package*.json /tmp/ts/

RUN set -e; \
  cd /tmp/ts; \
  npm ci --ignore-scripts; \
  for M in node_modules/*; do [ -d /usr/src/$M ] || mv -v $M /usr/src/$M; done; \
  rm -r /tmp/ts/node_modules

RUN sed -i "s/preset: undefined/preset: 'ts-jest'/" /usr/src/jest.config.js
