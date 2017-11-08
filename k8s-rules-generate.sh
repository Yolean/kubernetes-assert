#!/bin/bash

cd kube-prometheus
. hack/scripts/generate-rules-configmap.sh
cd ..

for f in k8s-yolean-rules/*.y*ml
do
  echo "  $(basename $f): |+"
  cat $f | sed "s/^/    /g"
done
