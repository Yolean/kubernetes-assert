FROM yolean/node:9dbe87fd2c204cbf0d06932dbe80257f3021f5f4@sha256:dad8bedca9dc0475bca3dbbc6e7e6c6bbf0cf8fa37ffe9b55629ac742f038288 \
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

FROM yolean/node:9dbe87fd2c204cbf0d06932dbe80257f3021f5f4@sha256:dad8bedca9dc0475bca3dbbc6e7e6c6bbf0cf8fa37ffe9b55629ac742f038288

ENV CI=true
COPY --chown=nonroot:nogroup package*.json .gitignore /usr/src/
WORKDIR /usr/src
RUN [ "git", "init" ]
RUN [ "npm", "ci", "--ignore-scripts" ]
# The above should be identical to the unittest stage

ENV ASSERT_IS_DEV= RERUN_WAIT=30

ENTRYPOINT [ "/usr/src/node_modules/.bin/jest", "--projects=/usr/src", "--watch", "--passWithNoTests" ]

# We could copy from context but buildkit won't run the unittest stage unless we somehow depend on the result
COPY --from=unittest /usr/src/jest.*.js ./

COPY --chown=nonroot:nogroup waiting-for-specs ./specs

WORKDIR /usr/src/specs
