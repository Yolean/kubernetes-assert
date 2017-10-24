#!/bin/bash
set -x

SOURCE_DIR=$(pwd)/tmp-prometheus-operator-$(date +%FT%H%M%S)
KUBE_DIR=$(pwd)/kube-prometheus

[ -e $KUBE_DIR ] && echo "$KUBE_DIR already exists. Was going to move the contrib folder there." && exit 1

OPERATOR_REPO=coreos/prometheus-operator
OPERATOR_VERSION=v0.14.0
OPERATOR_KUBE_DIR=contrib/kube-prometheus
OPERATOR_DEPLOY=hack/cluster-monitoring/deploy

OPERATOR_ARCHIVE_URL=https://github.com/$OPERATOR_REPO/archive/$OPERATOR_VERSION.tar.gz

[ -e $SOURCE_DIR ] && echo "Source dir $SOURCE_DIR already exists" && exit 1
mkdir $SOURCE_DIR

curl -SL -o $SOURCE_DIR/prometheus-operator.tgz $OPERATOR_ARCHIVE_URL
ARCHIVE_SHA256=$(shasum -a 256 $SOURCE_DIR/*.tgz)
tar -xzf $SOURCE_DIR/prometheus-operator.tgz --strip-components=1 -C $SOURCE_DIR
rm $SOURCE_DIR/prometheus-operator.tgz

echo "### $(date -u +%FT%H:%M:%SZ)" >> installed-version.txt
echo "$OPERATOR_ARCHIVE_URL" >> installed-version.txt
echo "$ARCHIVE_SHA256" >> installed-version.txt

mv -v $SOURCE_DIR/$OPERATOR_KUBE_DIR $KUBE_DIR
ln -s $KUBE_DIR $SOURCE_DIR/$OPERATOR_KUBE_DIR

# now customize the included deploy script

cd $KUBE_DIR

head -n 1 $OPERATOR_DEPLOY > deploy.sh
chmod u+x deploy.sh
cat << EOF >> deploy.sh

##### Customizations #####

set -x
cd $SOURCE_DIR
cd $OPERATOR_KUBE_DIR

# ServiceMonitor support disabled in favor of Prometheus' built in k8s service discovery
mkdir manifests/prometheus-service-monitor
mv -v manifests/prometheus/prometheus-k8s-service-monitor-* manifests/prometheus-service-monitor/
mv -v manifests/prometheus/prometheus-k8s.yaml manifests/prometheus-service-monitor/
cat manifests/prometheus-service-monitor/prometheus-k8s.yaml \
  | grep -v 'matchExpressions:' | grep -v '{key: k8s-app, operator: Exists}' \
  > manifests/prometheus/prometheus-k8s.yaml
diff -u manifests/prometheus-service-monitor/prometheus-k8s.yaml manifests/prometheus/prometheus-k8s.yaml

# Create config manually instead
# (has no effect here, see generate-prometheus-config.sh)
#kubectl create namespace monitoring
#kubectl -n monitoring create secret generic prometheus-k8s --from-file ../config/prometheus.yaml

### End customizations ###

EOF
cat $SOURCE_DIR/$OPERATOR_KUBE_DIR/$OPERATOR_DEPLOY >> deploy.sh

echo "Variants:"
diff -u hack/cluster-monitoring/minikube-deploy hack/cluster-monitoring/self-hosted-deploy

echo "In $(pwd) run ./deploy.sh"
