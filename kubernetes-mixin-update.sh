#!/usr/bin/env bash
[ -z "$DEBUG" ] || set -x
set -e

# expecting an existing clone of https://github.com/Yolean/kubernetes-mixin-managed
MIXIN_CLONE=../kubernetes-mixin-managed

(
  cd $MIXIN_CLONE;
  pwd; git remote -v; git branch; git rev-parse HEAD;
  curl https://gist.github.com/solsson/449f3ceba74859df5b6ead8f16b11dfa/raw/c9f2e5609a52376731da997e81ff185ed9b71869/build-kubernetes-mixin.sh | bash -;
)

jsontoyaml=~/go/bin/gojsontoyaml

cat << EOF > ./kubernetes-mixin/rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: kubernetes-mixin-rules
spec:
EOF
cat $MIXIN_CLONE/prometheus_rules.yaml | $jsontoyaml | sed 's|^|  |' >> ./kubernetes-mixin/rules.yaml

cat << EOF > ./kubernetes-mixin/alerts.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: kubernetes-mixin-alerts
spec:
EOF
cat $MIXIN_CLONE/prometheus_alerts.yaml | $jsontoyaml | sed 's|^|  |' >> ./kubernetes-mixin/alerts.yaml

rm kubernetes-mixin-dashboards/*
cp $MIXIN_CLONE/dashboards_out/* kubernetes-mixin-dashboards/
