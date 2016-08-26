url     = require 'url'
mqtt    = require 'mqtt'
env     = require './lib/env'
docker  = require './lib/docker'

config =
  mqtt:
    url: env.assert 'MQTT_URL'
    topicNs: env.assert 'MQTT_TOPIC_NS'
  docker:
    host: env.assert 'DOCKER_HOST'

client = mqtt.connect config.mqtt.url
client.on 'connect', ->
  console.log 'Connected to', config.mqtt.url

client.on 'error', (err) -> console.log 'An error occured', err
client.on 'close', -> console.log 'Connection closed'
publish = (topic, data) ->
  client.publish "#{config.mqtt.topicNs}#{topic}", JSON.stringify data


hasDashboardLabels = (event, container) ->
  event?.Actor?.Attributes?['bigboat/status/url'] or container?.Config?.Labels?['bigboat/status/url']

dockerUrl = url.parse config.docker.host
dockerConfig = if dockerUrl.host is '' and dockerUrl.path
  socketPath: dockerUrl.path
else
  host: dockerUrl.hostname
  port: dockerUrl.port

if not dockerConfig.socketPath and (not dockerConfig.host or not dockerConfig.port)
  console.error 'DOCKER_HOST env not properly configured, i got', dockerConfig
  process.exit(1)

console.log 'dockerConfig', dockerConfig

handler = (event, containerInfo, docker) ->
  publish '/events', event
  publish '/container/info', containerInfo if containerInfo

docker.listen handler, dockerConfig
