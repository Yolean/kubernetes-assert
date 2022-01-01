FROM golang:1.17.5-bullseye

COPY --from=grafana/jsonnet-build:7f1cb84@sha256:b904486a187411ee6776b0f1bd098b3fa2f6c456589480952c89533c8e196c2d /usr/bin/jsonnet /usr/local/bin/jsonnet

RUN go get github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb@v0.4.0
RUN go get github.com/brancz/gojsontoyaml
RUN pwd
WORKDIR /go/kubernetes-mixin
COPY . .
RUN jb init
RUN jb install github.com/kubernetes-monitoring/kubernetes-mixin@release-0.9
RUN jsonnet -J vendor -S -e 'std.manifestYamlDoc((import "mixin.libsonnet").prometheusAlerts)' > prometheus_alerts.yaml
RUN jsonnet -J vendor -S -e 'std.manifestYamlDoc((import "mixin.libsonnet").prometheusRules)' > prometheus_rules.yaml
RUN mkdir dashboards_out && jsonnet -J vendor -m dashboards_out -e '(import "mixin.libsonnet").grafanaDashboards'
