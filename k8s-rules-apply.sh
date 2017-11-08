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

$DIR/k8s-rules-generate.sh | kctl replace -f -
