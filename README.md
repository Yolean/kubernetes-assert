# Basic Kubernetes monitoring

... as Kustomize base.
The scope here is to set up basic monitoring using only `kubectl` as tooling.

## Apply

Assuming that Prometheus Operator is already installed,
start from the example kustomize base:

```
kubectl apply -k example-small
kubectl -n monitoring create -k kubernetes-mixin-dashboards
kubectl apply -k grafana
```

Note how [Prometheus](./example-small/now-prometheus.yaml) will match rules and monitors
using the label(s) that the [kustomization.yaml](./example-small/kustomization.yaml) adds.

## Re-generate stuff

This repo needs to have some generated content, where upstream kustomize bases could not be found

```
docker-compose -f docker-compose.test.yml up --build kubernetes-mixin
```

## Storage classes

Per cluster, for example

```
kubectl -n monitoring apply -f storageclasses-gke/
```
