# Kubernetes Assert

This is our re-think of [build-contract](https://github.com/Yolean/build-contract) for Kubernetes.

## Apply the example monitoring stack

Assuming that Prometheus Operator is already installed,
start from the example kustomize base:

```
kubectl apply -k example-small
kubectl -n monitoring create -k kubernetes-mixin-dashboards
kubectl apply -k grafana
```

Note how [Prometheus](./example-small/now-prometheus.yaml) will match rules and monitors
using the label(s) that the [kustomization.yaml](./example-small/kustomization.yaml) adds.

## Kustomize

A real stack would probably start from example-small but:

- Change the replicas count for prometheus and alertmanager
- Change the retention for prometheus `now` to a bit longer
- Add aggergation and long-term storage, presumably using [Thanos](https://thanos.io/)

## Re-generate stuff

This repo needs to have some generated content, where upstream kustomize bases could not be found

```
docker-compose -f docker-compose.test.yml up --build kubernetes-mixin
```

## CI test suite

WIP

```
docker volume rm kubernetes-monitoring_admin 2> /dev/null || true
./test.sh
```

## Development

WIP.
We tend to use they [y-stack](https://github.com/y-stack/ystack) but when working with test (in particular failing ones) it might help to reuse the CI stack.

```
compose='docker-compose -f docker-compose.test.yml -f docker-compose.dev-overrides.yml'
$compose down \
  ;docker volume rm kubernetes-monitoring_admin kubernetes-monitoring_k3s-server 2>/dev/null || true
sudo rm test/.kube/kubeconfig.yaml
$compose up -d sut
export KUBECONFIG=$PWD/test/.kube/kubeconfig.yaml
```
