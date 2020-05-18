FROM golang:1.14.3-buster@sha256:6edcc1af51905a860d510a7d4bb0a83d9a0e381cf05c07f23722020a4c688e6f

COPY --from=grafana/jsonnet-build:1022b37@sha256:652621250431682611ec91ba254f7f9975199d209e0b6504514a7612f57fe6ab /usr/bin/jsonnet /usr/local/bin/jsonnet

RUN go get github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb
RUN go get github.com/brancz/gojsontoyaml
RUN pwd
WORKDIR /go/kubernetes-mixin
COPY . .
RUN jb init
RUN jb install github.com/kubernetes-monitoring/kubernetes-mixin
RUN jsonnet -J vendor -S -e 'std.manifestYamlDoc((import "mixin.libsonnet").prometheusAlerts)' > prometheus_alerts.yaml
RUN jsonnet -J vendor -S -e 'std.manifestYamlDoc((import "mixin.libsonnet").prometheusRules)' > prometheus_rules.yaml
RUN mkdir dashboards_out && jsonnet -J vendor -m dashboards_out -e '(import "mixin.libsonnet").grafanaDashboards'
