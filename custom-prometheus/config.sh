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

kctl create secret generic $SECRET --from-file $DIR/config/prometheus.yaml --dry-run -o=yaml \
  | kubectl replace secret $SECRET -f -
