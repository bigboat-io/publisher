const td      = require('testdouble')

const Docker  = td.replace('../src/docker')
const bridge  = require('../src/dockerMqttBridge.js')


const anything = td.matchers.anything()
const config1 = {
  url: {
    hostname: 'dockerhost',
    port: 5000
  },
  snapshotInterval: 5000,
  filter: 'myfilter'
}
const config2 = {
  url: {
    host: '',
    path: '/docker.socket'
  },
  snapshotInterval: 5000,
  filter: 'myfilter'
}
const process_ = td.object(['exit'])

describe('dockerMqttBridge', () => {
  it('should be able to connect to a Docker daemon using a local socket', () => {
    const docker = td.object(['on'])
    td.when(Docker({socketPath:'/docker.socket'}, 'myfilter', 5000)).thenReturn(docker)
    bridge(config2, null, process_)
    td.verify(docker.on(anything, anything))
  })
  it('should be able to connect to a Docker daemon using HTTP', () => {
    const docker = td.object(['on'])
    td.when(Docker({host:'dockerhost',port:5000}, 'myfilter', 5000)).thenReturn(docker)
    bridge(config1, null, process_)
    td.verify(docker.on(anything, anything))
  })
  const dockerOnTest = (topic, mqtttTopic = topic) => {
    const docker = td.object(['on'])
    const mqtt   = td.object(['publish'])
    const captor = td.matchers.captor()
    td.when(Docker(anything, anything, anything)).thenReturn(docker)
    bridge(config1, mqtt, process_)
    td.verify(docker.on(topic, captor.capture()))
    captor.value({data:'data'})
    td.verify(mqtt.publish(mqtttTopic, {data:'data'}))
  }
  it('should forward all info events to the mqtt server', () => {
    dockerOnTest('/info')
  })
  it('should forward all docker events to the mqtt server', () => {
    dockerOnTest('/event', '/events')
  })
  it('should forward all docker container inspect data to the mqtt server', () => {
    dockerOnTest('/container/inspect')
  })
  it('should forward all docker container stats to the mqtt server', () => {
    dockerOnTest('/container/stats')
  })
  it('should forward all container id snapshots the mqtt server', () => {
    dockerOnTest('/snapshot/containerIds')
  })

})
