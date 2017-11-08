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

$DIR/k8s-rules-generate.sh | kctl apply -f -

# assuming port-forward
curl -v -X POST http://localhost:9090/-/reload
