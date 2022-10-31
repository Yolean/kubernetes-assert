# Kubernetes Assert

### WIP status: Search for `?)` in this text to find pending decisions. Search for TODO to find pending work.

Kubernetes Assert is our re-think of [build-contract](https://github.com/Yolean/build-contract), for Kubernetes.
As usual we don't write tooling. We combine mainstream stuff that we find lean enough.

Summary:

1. If you don't have a monitoring stack already, use the one from this repo.
   It's the Prometheus setup we use in dev clusters.
2. Arrange your specs like in [our example](./runtime-nodejs/example-project/) with a [skaffold.yaml](./runtime-nodejs/example-project/skaffold.yaml) and [kustomization.yaml](./runtime-nodejs/example-project/kustomization.yaml).
   - Our near term roadmap is to support "just put your spec files here" to run but we're not [there](./runtime-nodejs/example-specs/) yet. You need a [Dockerfile](./runtime-nodejs/example-project/Dockerfile).
   - You need a way to [build](https://skaffold.dev/docs/pipeline-stages/builders/) with Skaffold. Our examples use [y-stack](https://github.com/y-stack/ystack) which is completely local, but any build method is fine.
3. Run `skaffold dev`
4. Make sure Prometheus will [scrape `assertions_failed`](./assertions_failed/).
5. Watch for Alerts using for example
   `kubectl -n monitoring exec alertmanager-main-0 -c alertmanager -- wget -qO- http://127.0.0.1:9093/api/v2/alerts | jq`
   or the web interface, or a pager.

## What is a test

The idea is that any container that exports an `assertions_failed` counter (OR gauge?) is a test.
Obviously the metric needs to be scraped, and your team must be alerted about any(?) non-zeroness.
Integration test results are inherently less binary than unit tests. You may want to tweak the parameters for alerting, maybe on a per test basis.

## The dev loop

There won't be any tests if the dev loop is unpleasant.
Our idea of a good dev loop is that while you're editing your specs, they re-run on save and you'll see the test output.

The goal however is that tests run unattended, and reliably call for your attention when they fail.
At that point you'll want to know which test suite and test run that failed, and see the output.

Assumptions:

* Tests must run in-cluster. That's what they'll do during CI.
  - Running them locally while developing would cause "works for me" issuess.
* Skaffold is a good enough dev loop tool.
* Because Skaffold is the dev loop tool, `skaffold run` is the CI tool.
* The test environment is one of:
  - A local ephemeral cluster that starts empty when your test starts.
  - A local dev cluster like [y-stack](https://github.com/y-stack/ystack).
  - A temporary namespace in a test cluster with production-like backends.
  - An ephemeral kubernetes-in-kubernetes cluster managed by your CI pipeline. Could be [kind](https://github.com/kubernetes-sigs/kind).
* ... so as the test author you should simply assume that whatever is in your [skaffold.yaml](https://skaffold.dev/docs/references/yaml/)'s `deploy` section has been applied (you'll do the waiting), and the given context's current namespace is all yours.
  - TODO There'll be RBAC for read access, including access to logs.

We recommend using a _runtime_ for tests to a) minimize bolerplate and b) aid "common code ownership" for specs by enforcing a structure.

### The Node.js Jest runtime

Our first runtime for Kubernets Assert is based on [Jest](https://jestjs.io/):

* BDD style
* Specs don't need to be compiled, we can copy source to the runtime.
* The test runner will translate Jest results to `assertions_failed`. Specs are free to [export](https://www.npmjs.com/package/prom-client#counter) other metrics of any kind.
* By design we'll always run in [watch](https://jestjs.io/docs/en/cli#--watchall) mode. If specs are static that's equal to one test run but staying alive to keep exporting metrics.
   - Success criterias and cleanup is implemented by the pipeline.

How are specs delivered to the runtime?

1. If your specs are a "project", i.e. have a package.json, you need a proper build step. Use the runtime as base image. Install to `/usr/src/specs`(?). See example TODO.
   - Note that Jest `--watch` (i.e. the runtime's `skaffold dev`) requires source to be in a git repo. A `git init` with no commits is fine, but remember to include your `.gitignore`.
1. If your specs are fine with the [runtime's](./runtime-nodejs/package.json) `dependencies`
   (feel free to have utility .js files alongside specs) they need to be mounted or copied to `/usr/src/specs/src`(?)

How to avoid boilerplate?

* You still need yaml. But the actual workflow definition can be inherited from the runtime's [Kustomize base](./runtime-nodejs/base/) `- github.com/Yolean/kubernetes-assert/runtime-nodejs/kustomize/?ref=[your choice]`.
* Create your [kustomization.yaml](https://kubectl.docs.kubernetes.io/pages/reference/kustomize.html) then run `skaffold init`. See example TODO.

## Apply the example monitoring stack

Assuming that `github.com/coreos/prometheus-operator/?ref=[a recent revision]` is already installed,
start from the example kustomize base:

```
kubectl apply -k example-small
kubectl -n monitoring create -k kubernetes-mixin-dashboards
kubectl apply -k grafana
```

Note how [Prometheus](./example-small/now-prometheus.yaml) will match rules and monitors
using the label(s) that the [kustomization.yaml](./example-small/kustomization.yaml) adds.

## Your Kustomize base

A real stack might start from example-small and then:

- Change the replicas count for prometheus and alertmanager
- Change the retention for prometheus `now` to a bit longer
- Add aggergation and long-term storage, presumably using [Thanos](https://thanos.io/)

## Re-generate stuff

This repo needs to have some generated content, where upstream kustomize bases could not be found

```
docker-compose -f docker-compose.test.yml build --no-cache kubernetes-mixin
docker-compose -f docker-compose.test.yml up --no-build kubernetes-mixin
```

## CI test suite

Build only:

```
NOPUSH=true IMAGE_NAME=builds-registry.ystack.svc.cluster.local/yolean/assert ./hooks/build
```

Integration test:

```
NOPUSH=true IMAGE_NAME=solsson/kubernetes-assert:latest ./hooks/build
docker volume rm kubernetes-monitoring_admin 2> /dev/null || true
./test.sh
```

## Development

WIP.
We tend to use [y-stack](https://github.com/y-stack/ystack) but when working with test (in particular failing ones) it might help to reuse the CI stack.

```
compose='docker-compose -f docker-compose.test.yml -f docker-compose.dev-overrides.yml'
$compose down \
  ;docker volume rm kubernetes-monitoring_admin kubernetes-monitoring_k3s-server 2>/dev/null || true
sudo rm test/.kube/kubeconfig.yaml
$compose up -d sut
export KUBECONFIG=$PWD/test/.kube/kubeconfig.yaml
```

## Releases

```
git push
# wait for https://hub.docker.com/r/solsson/kubernetes-assert, then
YOLEAN_PROMOTE=true IMAGE_NAME=solsson/kubernetes-assert:latest ./hooks/build
# update examples so that people get started from refs
grep -A 1 bases: runtime-nodejs/example-project/kustomization.yaml
grep FROM runtime-nodejs/example-project/Dockerfile
# validate examples
```
