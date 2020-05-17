# Basic Kubernetes monitoring

... as Kustomize base.
The scope here is to set up basic monitoring using only `kubectl` as tooling.

## Apply

Assuming that Prometheus Operator is already installed,
start from the example kustomize base:

```
kubectl apply -k example-small
```

TODO
 * Prometheus finds no alertmanager endpoints
 * Grafana dashboards configmap is too large for apply
   - can we set `revisionHistoryLimit` = 0?

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
