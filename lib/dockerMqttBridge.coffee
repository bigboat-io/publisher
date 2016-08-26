#
# Bridges events and information obtained through the Docker API with MQTT
#

docker  = require './docker'

module.exports = (dockerCfg, mqtt) ->
  hasDashboardLabels = (event, container) ->
    event?.Actor?.Attributes?['bigboat/status/url'] or container?.Config?.Labels?['bigboat/status/url']

  dockerConfig = if dockerCfg.url.host is '' and dockerCfg.url.path
    socketPath: dockerCfg.url.path
  else
    host: dockerCfg.url.hostname
    port: dockerCfg.url.port

  if not dockerConfig.socketPath and (not dockerConfig.host or not dockerConfig.port)
    console.error 'Docker connection details not properly configured, I got', dockerConfig
    process.exit(1)

  handler = (event, containerInfo, docker) ->
    mqtt.publish '/events', event
    mqtt.publish '/container/info', containerInfo if containerInfo

  docker.listen handler, dockerConfig
