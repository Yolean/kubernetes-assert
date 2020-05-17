local kubernetes = import "kubernetes-mixin/mixin.libsonnet";

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
