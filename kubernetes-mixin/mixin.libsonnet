local kubernetes = import "kubernetes-mixin/mixin.libsonnet";

// TODO when we want to exclude/ignore stuff this could help: https://github.com/nabadger/monitoring-mixins

kubernetes {
  _config+:: {
    kubeApiserverSelector: 'job="apiserver"',
    kubeSchedulerSelector: 'job="apiserver"',
    // KubeControllerManagerDown alert disabled by Yolean/kubernetes-assert; is there a better way than to negate the selector?
    kubeControllerManagerSelector: 'job!="kube-controller-manager"',
    kubeStateMetricsSelector: 'job="kube-state-metrics"',
    nodeExporterSelector: 'job="node-exporter"',
    kubeletSelector: 'job="kubelet"',
  },
}
