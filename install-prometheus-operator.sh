#!/bin/bash
set -x

INSTALLER_TAG=$(date +%FT%H%M%S)
INSTALLER_DIR=$(pwd)/tmp-installer-$INSTALLER_TAG

OPERATOR_REPO=coreos/prometheus-operator
OPERATOR_VERSION=v0.14.0
OPERATOR_KUBE_DIR=contrib/kube-prometheus
OPERATOR_DEPLOY=hack/cluster-monitoring/deploy

OPERATOR_ARCHIVE_URL=https://github.com/$OPERATOR_REPO/archive/$OPERATOR_VERSION.tar.gz

mkdir $INSTALLER_DIR
cd $INSTALLER_DIR

SOURCE_DIR=./prometheus-operator
mkdir $SOURCE_DIR
echo "$SOURCE_DIR" >> .gitignore

curl -SL -o prometheus-operator.tgz $OPERATOR_ARCHIVE_URL
shasum -a 256 *.* > sha256sum.txt
tar -xzf prometheus-operator.tgz --strip-components=1 -C $SOURCE_DIR
rm prometheus-operator.tgz

head -n 1 $SOURCE_DIR/$OPERATOR_KUBE_DIR/$OPERATOR_DEPLOY > deploy.sh
chmod u+x deploy.sh
cat << EOF >> deploy.sh

set -x
cd $SOURCE_DIR
cd $OPERATOR_KUBE_DIR

# ServiceMonitor support disabled in favor of Prometheus' built in k8s service discovery
mkdir manifests/prometheus-service-monitor
mv -v manifests/prometheus/prometheus-k8s-service-monitor-* manifests/prometheus-service-monitor/
mv -v manifests/prometheus/prometheus-k8s.yaml manifests/prometheus-service-monitor/
cat manifests/prometheus-service-monitor/prometheus-k8s.yaml \
  | grep -v 'matchExpressions:' | grep -v '- {key: k8s-app, operator: Exists}' \
  > manifests/prometheus/prometheus-k8s.yaml
diff -u manifests/prometheus-service-monitor/prometheus-k8s.yaml manifests/prometheus/prometheus-k8s.yaml

# Create config manually instead
kubectl create namespace monitoring
kubectl -n monitoring create secret generic prometheus-k8s --from-file ../../../../config/prometheus.yaml

EOF
cat $SOURCE_DIR/$OPERATOR_KUBE_DIR/$OPERATOR_DEPLOY >> deploy.sh

echo "Variants:"
diff -u hack/cluster-monitoring/minikube-deploy hack/cluster-monitoring/self-hosted-deploy

echo "At $(pwd), run ./deploy.sh"
