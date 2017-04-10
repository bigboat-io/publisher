const url = require('url')
const {assert, get} = require('./src/env')
const Mqtt = require('./src/mqtt')
const DockerMqttBridge = require('./src/dockerMqttBridge')

const config = {
  mqtt: {
    url: assert('MQTT_URL'),
    user: get('MQTT_USER', null),
    pass: get('MQTT_PASS', null),
    topicNs: assert('MQTT_TOPIC_NS')
  },
  docker: {
    url: url.parse(assert('DOCKER_HOST')),
    filter: JSON.parse(process.env['DOCKER_EVENTS_FILTER'] || '{}'),
    snapshotInterval: get('SNAPSHOT_INTERVAL', 60000),
  }
}

new DockerMqttBridge(config.docker, Mqtt(config.mqtt))
