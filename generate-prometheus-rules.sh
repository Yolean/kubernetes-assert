#!/bin/bash

cd kube-prometheus
. hack/scripts/generate-rules-configmap.sh
cd ..

for f in rules/*.rules.yaml
do
  echo "  $(basename $f): |+"
  cat $f | sed "s/^/    /g"
done
