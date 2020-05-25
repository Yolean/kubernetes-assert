FROM yolean/node@sha256:a0141027783eb712197efe3ac1b42726da0da1c72ecafed99991ddf511086427

# Jest watch depends on git
RUN git --version

RUN set -e; \
  F=$(mktemp); \
  curl -SLs https://dl.k8s.io/v1.17.5/kubernetes-client-linux-amd64.tar.gz \
    | tee $F \
    | tar xzf - --strip-components=3 -C /usr/local/bin/; \
  echo "4cf67f972aad3425bccc48af83f8cb59ddcc96de49d3bb21cdbbcbbeee31718ef681e551d13343538a6e70c2a4ea0435e4540bc1f8cf1a91a2f73265f52b9429 $F" \
    | sha512sum -c -; \
  rm $F

# Note that there's also a nouser 65534 user which has no writable home
RUN echo 'nonroot:x:65532:65534:nonroot:/home/nonroot:/usr/sbin/nologin' >> /etc/passwd && \
  mkdir -p /home/nonroot && touch /home/nonroot/.bash_history && chown -R 65532:65534 /home/nonroot
USER nonroot:nogroup

WORKDIR /home/nonroot
