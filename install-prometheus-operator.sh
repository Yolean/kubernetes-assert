#!/bin/bash
set -x

INSTALLER_TAG=$(date +%FT%H%M%S)
INSTALLER_DIR=$(pwd)/tmp-installer-$INSTALLER_TAG

OPERATOR_REPO=coreos/prometheus-operator
OPERATOR_VERSION=v0.14.0
OPERATOR_KUBE_DIR=contrib/kube-prometheus
OPERATOR_DEPLOY=hack/cluster-monitoring/deploy

OPERATOR_ARCHIVE_URL=https://github.com/$OPERATOR_REPO/archive/$OPERATOR_VERSION.tar.gz

SOURCE_DIR=$INSTALLER_DIR/prometheus-operator
mkdir $INSTALLER_DIR
mkdir $SOURCE_DIR

cd $INSTALLER_DIR

curl -SL -o prometheus-operator.tgz $OPERATOR_ARCHIVE_URL
shasum -a 256 *.* > sha256sum.txt
tar -xzf prometheus-operator.tgz --strip-components=1 -C $SOURCE_DIR

head -n 1 $SOURCE_DIR/$OPERATOR_KUBE_DIR/$OPERATOR_DEPLOY > deploy.sh
chmod u+x deploy.sh
cat << EOF >> deploy.sh

set -x
cd $SOURCE_DIR
cd $OPERATOR_KUBE_DIR

EOF
cat $SOURCE_DIR/$OPERATOR_KUBE_DIR/$OPERATOR_DEPLOY >> deploy.sh

echo "At $(pwd), run ./deploy.sh"
