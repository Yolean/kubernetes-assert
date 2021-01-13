FROM yolean/node:682b35452193e841717e6749a7de1df6e1ac4f6a@sha256:2ae6c3cfd92c8298cb57ce304c18d58523759e92ae92f668e8d1de97fa9876fb \
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

FROM yolean/node:682b35452193e841717e6749a7de1df6e1ac4f6a@sha256:2ae6c3cfd92c8298cb57ce304c18d58523759e92ae92f668e8d1de97fa9876fb

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
