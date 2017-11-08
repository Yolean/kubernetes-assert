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

SECRET=alertmanager-main

kctl create secret generic $SECRET --from-file $DIR/alertmanager.yaml --dry-run -o=yaml \
  | kctl replace secret $SECRET -f -
