FROM yolean/node:55fc6cce124e31a053b9eb57a3d0e9212a98bee0@sha256:870d8cb2f70fa6ab73b53e115bc4ed471534c4ce96ff1083f4475743697d4c55 as unittest

ENV CI=true

WORKDIR /usr/src/runtime

COPY --chown=nonroot package*.json .gitignore ./

RUN git init && npm ci --ignore-scripts

# Everything above should be identical to runtime build (next FROM), but now we need dev dependencies
RUN npm install --ignore-scripts

# Note that unlike our target audience's specs these are just unit tests
# but with skaffold dev the src folder will be synced to the running container, for experiments
COPY --chown=nonroot . .

RUN npm test

FROM yolean/node:55fc6cce124e31a053b9eb57a3d0e9212a98bee0@sha256:870d8cb2f70fa6ab73b53e115bc4ed471534c4ce96ff1083f4475743697d4c55

ENV CI=true

WORKDIR /usr/src/runtime

COPY package*.json .gitignore ./

RUN git init && npm ci --ignore-scripts

ENTRYPOINT [ "./node_modules/.bin/jest", "--watchAll", "--passWithNoTests" ]

# We could copy from context but buildkit won't run the unittest stage unless we somehow depend on the result
COPY --from=unittest /usr/src/runtime/jest.*.js ./

COPY --chown=nonroot waiting-for-specs ./src
