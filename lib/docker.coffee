events        = require 'events'
Docker        = require 'dockerode'


module.exports = (opts) ->

  docker = new Docker(opts)
  eventEmitter = new events.EventEmitter()

  # Publishes docker inspect info to the eventEmitter
  publishContainerInfo = (containerId) ->
    docker.getContainer(containerId).inspect (err, data) ->
      eventEmitter.emit '/container/info', data unless err

  publishContainerStats = ->
    docker.listContainers { all: 1 }, (err, containers) ->
      containers.forEach (containerInfo) ->
        docker.getContainer(containerInfo.Id).stats stream:0, (err, data) ->
          console.log err if err
          chunks = ""
          data.on 'data', (chunk) -> chunks = "#{chunks}#{chunk}"
          data.on 'end', ->
            eventEmitter.emit '/container/stats',
              container: containerInfo
              stats: JSON.parse chunks

  publishDockerInfo = ->
    docker.info (err, info) ->
      eventEmitter.emit '/info', info

  publishExistingContainers = ->
    i = 10
    docker.listContainers { all: 1 }, (err, containers) ->
      containers.forEach (containerInfo) ->
        setTimeout (-> publishContainerInfo containerInfo.Id), i
        i = i + 10

  listenForEvents = ->
    trackedEvents = [
      'start'
      'die'
      'destroy'
      'pull'
    ]

    processDockerEvent = (event, stop) ->
      if trackedEvents.indexOf(event.status) != -1
        eventEmitter.emit '/event', event
        setTimeout (-> publishContainerInfo event.id), 500

    docker.getEvents (err, data) ->
      if err
        console.log('Error getting docker events: %s', err.message, err)
      data.on 'data', (chunk) ->
        lines = chunk.toString().replace(/\n$/, '').split('\n')
        lines.forEach (line) ->
          try
            if line then processDockerEvent JSON.parse(line)
          catch e
            console.log 'Error reading Docker event: %s', e.message, line


  publishDockerInfo()
  publishExistingContainers()
  publishContainerStats()
  setInterval publishContainerStats, 10000
  listenForEvents()

  eventEmitter # return eventEmitter so clients can register callbacks
