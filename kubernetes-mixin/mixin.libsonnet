local kubernetes = import "kubernetes-mixin/mixin.libsonnet";

// TODO when we want to exclude/ignore stuff this could help: https://github.com/nabadger/monitoring-mixins

kubernetes {
  _config+:: {
    kubeApiserverSelector: 'job="apiserver"',
    kubeSchedulerSelector: 'job="apiserver"',
    kubeControllerManagerSelector: 'job="TODO-or-IGNORE"',
    kubeStateMetricsSelector: 'job="kube-state-metrics"',
    nodeExporterSelector: 'job="node-exporter"',
    kubeletSelector: 'job="kubelet"',
  },
}
