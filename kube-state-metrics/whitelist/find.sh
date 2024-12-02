#!/usr/bin/env bash
[ -z "$DEBUG" ] || set -x
set -e

# ./kube-state-metrics/whitelist/find.sh | grep -v '=0' | cut -d' ' -f1 | sort | uniq

DIR="$(dirname $0)"
BASE="$DIR/../.."

for search in \
  $BASE/kubernetes-mixin/*.yaml \
  $BASE/kubernetes-mixin-dashboards/*.json \
; do
  for name in $(cat $DIR/sample_metric_names.txt | awk '{ print $2 }'); do
    echo -n "$name $search ="
    grep "$name" $search | wc -l | bc || true
  done
done
