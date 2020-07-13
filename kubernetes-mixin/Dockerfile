FROM golang:1.14.4-buster@sha256:1af90b2bb59d67e2523ae79c03a4acc063d5fba670f856666c682a6369052393

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
