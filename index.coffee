url               = require 'url'
env               = require './lib/env'
Mqtt              = require './lib/mqtt'
DockerMqttBridge  = require './lib/dockerMqttBridge'

config =
  mqtt:
    url: env.assert 'MQTT_URL'
    topicNs: env.assert 'MQTT_TOPIC_NS'
  docker:
    url: url.parse env.assert 'DOCKER_HOST'

new DockerMqttBridge config.docker, new Mqtt config.mqtt
