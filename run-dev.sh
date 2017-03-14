#!/bin/bash

npm install
typings install
tsc

# DOCKER_HOST=unix:///var/run/docker.sock \
DOCKER_HOST=tcp://10.19.88.248:2375 \
MQTT_URL=mqtt://localhost \
MQTT_USER=user \
MQTT_PASS=pass \
MQTT_TOPIC_NS=/docker \
DOCKER_EVENTS_FILTER='{"label":["bigboat.domain=infra"]}' \
SNAPSHOT_INTERVAL=60000 \
nodemon built/index.js
