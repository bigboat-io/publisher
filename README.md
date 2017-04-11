# MQTT Docker Publisher
[![CircleCI](https://img.shields.io/circleci/project/github/ICTU/bigboat-docker-publisher.svg)](https://circleci.com/gh/ICTU/bigboat-docker-publisher)
[![Coverage Status](https://coveralls.io/repos/github/ICTU/bigboat-docker-publisher/badge.svg?branch=master)](https://coveralls.io/github/ICTU/bigboat-docker-publisher?branch=master)
[![codecov](https://codecov.io/gh/ICTU/bigboat-docker-publisher/branch/master/graph/badge.svg)](https://codecov.io/gh/ICTU/bigboat-docker-publisher)
[![BCH compliance](https://bettercodehub.com/edge/badge/ICTU/bigboat-docker-publisher)](https://bettercodehub.com/)


An MQTT Docker publisher for the BigBoat ecosystem.

## About

MQTT Docker publisher publishes data from the Docker API to an MQTT Server.
Currently the following topics are published:

 * /info
  (https://docs.docker.com/engine/reference/api/docker_remote_api_v1.23/#/display-system-wide-information)
 * /event
 (https://docs.docker.com/engine/reference/api/docker_remote_api_v1.23/#/monitor-docker-s-events)
 * /container/info (https://docs.docker.com/engine/reference/api/docker_remote_api_v1.23/#/inspect-a-container)
 * /container/stats (https://docs.docker.com/engine/reference/api/docker_remote_api_v1.23/#/get-container-stats-based-on-resource-usage)

 Each topic is preceded by the value of **MQTT_TOPIC_NS**. This namespace mechanism allows multiple publishers to use the same mqtt server.

## How to run

    docker run \
      -e DOCKER_HOST=tcp://dockerhost:2375 \
      -e MQTT_URL=mqtt://mqttserver \
      -e MQTT_TOPIC_NS=/docker \
      --name docker-publisher
      ictu/bigboat-docker-publisher

## Contributing

If you want to contribute please fork the repo and submit a pull request in
order to get your changes merged into the main branch.

### Development

Below you find an example of how to run the agent for development.

    #!/bin/bash

    DOCKER_HOST=tcp://dockerhost:2375 \
    MQTT_URL=mqtt://mqttserver \
    MQTT_TOPIC_NS=/docker \
    nodemon index.coffee
