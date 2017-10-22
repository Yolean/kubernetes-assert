# Our Prometheus setup

The first incarnation of this repo was a fork of [bakins/minikube-prometheus-demo](https://github.com/bakins/minikube-prometheus-demo) which is a plain-manifests setup
(like our [kubernetes-kafka](https://github.com/Yolean/kubernetes-kafka)).

Now we've instead configured Prometheus using
[coreos/prometheus-operator](https://github.com/coreos/prometheus-operator)
and the manifests in its [contrib]()https://github.com/coreos/prometheus-operator/tree/v0.14.0/contrib/kube-prometheus folder.

See the script next to this readme for details, and [PR #4](https://github.com/Yolean/kubernetes-monitoring/pull/4) for the transition.
