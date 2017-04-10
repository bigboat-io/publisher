//
// Bridges events and information obtained through the Docker API with MQTT
//

const Docker =  require('./docker')

module.exports = function(dockerCfg, mqtt, _process=process) {
  var dockerConfig

  if(dockerCfg.url.host === '' && dockerCfg.url.path){
    dockerConfig = { socketPath: dockerCfg.url.path }
    if(!dockerConfig.socketPath){
      console.error('Docker connection details not properly configured, I got', dockerConfig)
      _process.exit(1)
    }
  } else {
    dockerConfig = {
      host: dockerCfg.url.hostname,
      port: dockerCfg.url.port
    }
    if(!dockerConfig.host || !dockerConfig.port){
      console.error('Docker connection details not properly configured, I got', dockerConfig)
      _process.exit(1)
    }
  }

  const docker = Docker(dockerConfig, dockerCfg.filter, dockerCfg.snapshotInterval)
  docker.on('/info', (stats) => mqtt.publish('/info', stats))
  docker.on('/event', (event) => mqtt.publish('/events', event))
  docker.on('/container/inspect', (info) => mqtt.publish('/container/inspect', info))
  docker.on('/container/stats', (stats) => mqtt.publish('/container/stats', stats))
  docker.on('/snapshot/containerIds', (ids) => { mqtt.publish('/snapshot/containerIds', ids)})
}
