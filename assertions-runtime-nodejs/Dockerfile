FROM yolean/node@sha256:a0141027783eb712197efe3ac1b42726da0da1c72ecafed99991ddf511086427 as unittest

# https://github.com/Yolean/docker-base/commit/5df42e26c7720527979f6ad83f1281424645fd3f
RUN grep 'nonroot:x:65532' /etc/passwd || \
  echo 'nonroot:x:65532:65534:nonroot:/home/nonroot:/usr/sbin/nologin' >> /etc/passwd && \
  mkdir -p /home/nonroot && touch /home/nonroot/.bash_history && chown -R 65532:65534 /home/nonroot
USER nonroot:nogroup

ENV CI=true

WORKDIR /usr/src/runtime

COPY package*.json .gitignore ./

RUN git init && npm ci --ignore-scripts

# Everything above should be identical to runtime build (next FROM), but now we need dev dependencies
RUN npm install --ignore-scripts

COPY *-reporter.js src ./

RUN npm test

FROM yolean/node@sha256:a0141027783eb712197efe3ac1b42726da0da1c72ecafed99991ddf511086427

# https://github.com/Yolean/docker-base/commit/5df42e26c7720527979f6ad83f1281424645fd3f
RUN grep 'nonroot:x:65532' /etc/passwd || \
  echo 'nonroot:x:65532:65534:nonroot:/home/nonroot:/usr/sbin/nologin' >> /etc/passwd && \
  mkdir -p /home/nonroot && touch /home/nonroot/.bash_history && chown -R 65532:65534 /home/nonroot
USER nonroot:nogroup

ENV CI=true

WORKDIR /usr/src/runtime

COPY package*.json .gitignore ./

RUN git init && npm ci --ignore-scripts

# We could copy from context but buildkit won't run the unittest stage unless we somehow depend on the result
COPY --from=unittest *-reporter.js ./

ENTRYPOINT [ "./node_modules/.bin/jest", "--watch" ]

COPY waiting-for-specs src
