#
# Bridges events and information obtained through the Docker API with MQTT
#

Docker  = require './docker'

module.exports = (dockerCfg, mqtt) ->

  dockerConfig = if dockerCfg.url.host is '' and dockerCfg.url.path
    socketPath: dockerCfg.url.path
  else
    host: dockerCfg.url.hostname
    port: dockerCfg.url.port

  if not dockerConfig.socketPath and (not dockerConfig.host or not dockerConfig.port)
    console.error 'Docker connection details not properly configured, I got', dockerConfig
    process.exit(1)

  docker = new Docker dockerConfig
  docker.on '/info', (stats) -> mqtt.publish '/info', stats
  docker.on '/event', (event) -> mqtt.publish '/events', event
  docker.on '/container/info', (info) -> mqtt.publish '/container/info', info
  docker.on '/container/stats', (stats) -> mqtt.publish '/container/stats', stats
