#!/bin/bash
echo -n Please enter the Slack Incoming WebHooks URL:
read -s slack_alerts_webhook_url
echo
kubectl create secret generic slack-secret --namespace=monitoring --from-literal=slack_alerts_webhook_url=$slack_alerts_webhook_url
