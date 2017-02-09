#!/bin/bash

npm install
typings install
tsc

# DOCKER_HOST=unix:///var/run/docker.sock \
DOCKER_HOST=tcp://10.19.88.248:2375 \
MQTT_URL=mqtt://localhost \
MQTT_TOPIC_NS=/docker \
nodemon built/index.js
