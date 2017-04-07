const events = require('events')
const Docker = require('dockerode')

module.exports = (opts, filter, snapshotInterval) => {
  const docker = new Docker(opts)
  const eventEmitter = new events.EventEmitter()

  // Publishes docker inspect info to the eventEmitter
  function publishContainerInfo(containerId) {
    docker.getContainer(containerId).inspect((err, data) => {
      if (!err) {
        console.log('emit /container/inspect', containerId)
        eventEmitter.emit('/container/inspect', data)
      } else {
        console.error(`Errror occured while inspecting container with ${containerId}`, err)
      }
    })
  }

  // function publishContainerStats() {
  //   docker.listContainers({
  //     all: 1,
  //     filters: filter
  //   }, (err, containers) => {
  //     if (err) {
  //       return console.error('Error while listing containers: %s', err.message, err);
  //     }
  //     containers.forEach((containerInfo) =>
  //       docker.getContainer(containerInfo.Id).stats({stream: 1}, (err, data) => {
  //         var chunks;
  //         if (err) {
  //           console.log(err);
  //         } else {
  //           chunks = '';
  //           data.on('data', (chunk) => chunks = chunks + chunk);
  //           data.on('end', () => {
  //             try {
  //               const parsed = JSON.parse(chunks);
  //               eventEmitter.emit('/container/stats', {
  //                   container: containerInfo,
  //                   stats: parsed
  //               });
  //             } catch (e) {
  //               console.error('Error during parsing JSON stats', e, 'Chunks I got so far: ' + chunks);
  //             }
  //           });
  //         }
  //     }));
  //   });
  // }

  function publishDockerInfo() {
    return docker.info((err, info) => {
      if (err) {
        return console.error('Error while retrieving Docker info: %s', err.message, err)
      }
      console.log('emit /info')
      eventEmitter.emit('/info', info)
    })
  }

  function publishExistingContainers() {
    var i = 10
    return docker.listContainers({
      all: 1,
      filters: filter
    }, (err, containers) => {
      if (err) {
        return console.error('Error while listing containers: %s', err.message, err)
      }
      containers.forEach((containerInfo) => {
        setTimeout((() => publishContainerInfo(containerInfo.Id)), i)
        i = i + 10
      })
    })
  }

  function listenForEvents() {
    const inspectOnEvents = ['create', 'start', 'kill', 'die', 'stop', 'dead', 'destroy', 'top', 'health_status: healthy', 'health_status: unhealthy']

    function processDockerEvent(event) {
      console.log('emit /event', event.id)
      eventEmitter.emit('/event', event)
      if(inspectOnEvents.indexOf(event.status) != -1){
        setTimeout((() => publishContainerInfo(event.id)), 500)
      }
    }

    docker.getEvents({filters: filter}, (err, data) => {
      if (err) {
        console.error('Error while retrieving events: %s', err.message, err)
        setTimeout(listenForEvents, 1000)
        return
      }
      data.on('close', () => {
        console.error('Docker event stream closed unexpectedly!')
        setTimeout(listenForEvents, 500)
      })
      return data.on('data', (chunk) => {
        var lines
        lines = chunk.toString().replace(/\n$/, '').split('\n')
        lines.forEach((line) => {
          try {
            if (line) {
              processDockerEvent(JSON.parse(line))
            }
          } catch (e) {
            console.error('Error reading Docker event: %s', e.message, line)
          }
        })
      })
    })
  }

  function publishContainerIdsSnapshot(){
    docker.listContainers({all: 1, filters: filter}, (err, containers) => {
      if(err){
        return console.error('Error while retrieving container ids for snapshot: %s', err.message, err)
      }
      const containerIds = containers.map((c)=>{return c.Id})
      eventEmitter.emit('/snapshot/containerIds', containerIds)
      console.log('emit /snapshot/containerIds',containerIds)
    })
  }

  publishDockerInfo()
  publishExistingContainers()
  listenForEvents()

  // setup periodical emitters
  setInterval(publishContainerIdsSnapshot, snapshotInterval)

  return eventEmitter  // return eventEmitter so clients can register callbacks
}
