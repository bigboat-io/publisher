#!/bin/bash

DOCKER_HOST=tcp://10.19.88.248:2375 \
MQTT_URL=mqtt://localhost \
MQTT_TOPIC_NS=/docker \
nodemon index.coffee
