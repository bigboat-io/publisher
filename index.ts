
import url = require('url');
import { assert } from './lib/env';
import Mqtt from './lib/mqtt';
import DockerMqttBridge from "./lib/dockerMqttBridge";

const config = {
    mqtt: {
        url: assert("MQTT_URL"),
        user: assert("MQTT_USER"),
        pass: assert("MQTT_PASS"),
        topicNs: assert("MQTT_TOPIC_NS")
    },
    docker: {
        url: url.parse(assert("DOCKER_HOST")),
        filter: JSON.parse(process.env["DOCKER_EVENTS_FILTER"] || "{}")
    }
};

new DockerMqttBridge(config.docker, Mqtt(config.mqtt));

console.log("wieee")
