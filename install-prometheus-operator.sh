#!/bin/bash
set -x

SOURCE_DIR=$(pwd)/tmp-prometheus-operator-$(date +%FT%H%M%S)
KUBE_DIR=$(pwd)/kube-prometheus

[ -e $KUBE_DIR ] && echo "$KUBE_DIR already exists. Was going to move the contrib folder there." && exit 1

OPERATOR_REPO=coreos/prometheus-operator
OPERATOR_VERSION=v0.22.2
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

cat <<EOF >> manifests/prometheus/prometheus-k8s.yaml
  storage:
    volumeClaimTemplate:
      metadata:
        name: prometheus
      spec:
        resources:
          requests:
            storage: 100Gi
EOF

echo "Variants:"
diff -u hack/cluster-monitoring/minikube-deploy hack/cluster-monitoring/self-hosted-deploy

# https://github.com/coreos/prometheus-operator/blob/7b946a07df8a94ad31f9624483f9129090507a5c/contrib/kube-prometheus/docs/GKE-cadvisor-support.md
sed -i -e 's/https/http/g' manifests/prometheus/prometheus-k8s-service-monitor-kubelet.yaml

bash -x $OPERATOR_DEPLOY
