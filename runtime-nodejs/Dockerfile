FROM yolean/node:55fc6cce124e31a053b9eb57a3d0e9212a98bee0@sha256:870d8cb2f70fa6ab73b53e115bc4ed471534c4ce96ff1083f4475743697d4c55 \
  as unittest

ENV CI=true
COPY --chown=nonroot:nogroup package*.json .gitignore /usr/src/
WORKDIR /usr/src
RUN [ "git", "init" ]
RUN [ "npm", "ci", "--ignore-scripts" ]
# The above should be identical to runtime stage (next FROM)

# Note that unlike our target audience's specs these are just unit tests
# but with skaffold dev the src folder will be synced to the running container, for experiments
COPY --chown=nonroot:nogroup . .
RUN [ "npm", "test" ]

FROM yolean/node:55fc6cce124e31a053b9eb57a3d0e9212a98bee0@sha256:870d8cb2f70fa6ab73b53e115bc4ed471534c4ce96ff1083f4475743697d4c55

ENV CI=true
COPY --chown=nonroot:nogroup package*.json .gitignore /usr/src/
WORKDIR /usr/src
RUN [ "git", "init" ]
RUN [ "npm", "ci", "--ignore-scripts" ]
# The above should be identical to the unittest stage

ENTRYPOINT [ "/usr/src/node_modules/.bin/jest", "--projects=/usr/src", "--watch", "--passWithNoTests" ]

# We could copy from context but buildkit won't run the unittest stage unless we somehow depend on the result
COPY --from=unittest /usr/src/jest.*.js ./

COPY --chown=nonroot:nogroup waiting-for-specs ./specs

WORKDIR /usr/src/specs--must-be-set-explicitly-by-downstream-images--for-now
