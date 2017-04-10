const assert  = require('assert')
const td      = require('testdouble')

var dockerode, events, docker, emitter, captor, setTimeout, setInterval

describe('docker', () => {
  afterEach(() => td.reset())
  beforeEach(() => {
    dockerode  = td.replace('dockerode')
    events  = td.replace('events')
    docker  = require('../src/docker.js')
    emitter = td.object(['emit'])
    setTimeout = td.function()
    setInterval = td.function()

    td.when(events.EventEmitter()).thenReturn(emitter)
    captor = td.matchers.captor()
  })
  it('should return an eventEmitter', () => {
    const myEmitter = docker('opts', 'filter', 'myinterval', setInterval, setTimeout)
    assert.equal(myEmitter, emitter)
  })
  it('should publish container snapshots periodically', () => {
    setInterval = td.function()
    docker('opts', 'filter', 'myinterval', setInterval, setTimeout)
    td.verify(setInterval(captor.capture(), 'myinterval'))
    captor.value() //invoke setInterval callback
    td.verify(dockerode.prototype.listContainers({all: 1, filters: 'filter'}, captor.capture()))
    captor.value(null, [{Id:1}, {Id: 2}]) //invoke listContainers callback
    td.verify(emitter.emit('/snapshot/containerIds', [1,2]))

  })
  it('should publish existing containers', () => {
    docker('opts', 'myfilter', 'myinterval', setInterval, setTimeout)
    td.verify(dockerode.prototype.listContainers({all: 1, filters: 'myfilter'}, captor.capture()))
    captor.value(null, [{Id:1}])
    td.verify(setTimeout(captor.capture(), 10))
    const container = td.object(['inspect'])
    td.when(dockerode.prototype.getContainer(1)).thenReturn(container)
    captor.value() // invoke timeout callback
    td.verify(container.inspect(captor.capture()))
    captor.value(null, 'myData')
    td.verify(emitter.emit('/container/inspect', 'myData'))
  })
  it('should publish docker info', () => {
    docker('opts', 'myfilter', 'myinterval', setInterval, setTimeout)
    td.verify(dockerode.prototype.info(captor.capture()))
    captor.value(null, 'myinfo')
    td.verify(emitter.emit('/info', 'myinfo'))
  })
  it('should listen for docker events and publish them', () => {
    docker('opts', 'myfilter', 'myinterval', setInterval, setTimeout)
    td.verify(dockerode.prototype.getEvents({filters:'myfilter'},captor.capture()))
    const data = td.object(['on'])
    captor.value(null, data)
    td.verify(data.on('data', captor.capture()))
    captor.value('{"id":1}\n{"id":2}\n')
    td.verify(emitter.emit('/event', {id: 1}))
    td.verify(emitter.emit('/event', {id: 2}))
  })
})
