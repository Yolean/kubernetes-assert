#!/bin/bash
set -e
set -x
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ -z "${NAMESPACE}" ]; then
    NAMESPACE=monitoring
fi

kctl() {
    kubectl --namespace "$NAMESPACE" "$@"
}

SECRET=prometheus-custom

kctl create secret generic $SECRET --from-file $DIR/config/prometheus.yaml --dry-run

# Before you've created a custom secret, operator will re-create the empty one immediately upon delete
kctl scale --replicas=0 deploy/prometheus-operator
sleep 1
kctl delete secret $SECRET
sleep 1
kctl create secret generic $SECRET --from-file config/prometheus.yaml
kctl scale --replicas=1 deploy/prometheus-operator
# we've lost the auto-restart feature of the operator
kctl scale --replicas=0 statefulset prometheus-k8s
kctl scale --replicas=2 statefulset prometheus-k8s
