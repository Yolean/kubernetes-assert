# Our Prometheus setup

The first incarnation of this repo was a fork of [bakins/minikube-prometheus-demo](https://github.com/bakins/minikube-prometheus-demo) which is a plain-manifests setup
(like our [kubernetes-kafka](https://github.com/Yolean/kubernetes-kafka)).

Now we've instead configured Prometheus using
[coreos/prometheus-operator](https://github.com/coreos/prometheus-operator)
and the manifests in its [contrib]()https://github.com/coreos/prometheus-operator/tree/v0.14.0/contrib/kube-prometheus folder.

See [PR #4](https://github.com/Yolean/kubernetes-monitoring/pull/4) for the transition.

## kube-prometheus

Sets up the operator, and the example `k8s` promehteus instance
to monitor Kubernetes internals.

We want to be able to completely replace the operator,
which is why there's a script that pulls and applies a [release](https://github.com/coreos/prometheus-operator/releases).

```bash
./install-prometheus-operator.sh
kubectl -n monitoring get pods -w
```

You may then want to add kube-prometheus to version control,
prior to customizations.

## custom-prometheus

There's also a `Prometheus` resource called `custom`,
which supports [Service Discovery](https://prometheus.io/docs/operating/configuration/#%3Ckubernetes_sd_config%3E) based on
`prometheus.io/scrape` `annotations` (prometheus-operator [doesn't](https://github.com/coreos/kube-prometheus/pull/16#issuecomment-305933103)).

```bash
kubectl apply -f custom-prometheus/
./custom-prometheus/config.sh
```

## additional instances

Let's keep `prometheus-k8s` for Kubernetes monitoring
and have separate instances for other services like
[kafka](https://github.com/Yolean/kubernetes-kafka),
[mysql](https://github.com/Yolean/kubernetes-mysql-cluster),
and [keycloak](https://github.com/jboss-dockerfiles/keycloak/pull/92).
A smaller set of time series per instance simplifies
ad-hoc analysis, at least until we've established naming conventions.

An important alarm is if cluster size, for all of the above,
drops below a desired value for a prolonged period of time
(more than it takes to restart an instance on a new node).

Such checks can't be done in readiness probes
(or it would be very risky).
