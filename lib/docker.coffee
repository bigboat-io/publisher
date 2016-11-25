events        = require 'events'
Docker        = require 'dockerode'


module.exports = (opts) ->

  docker = new Docker(opts)
  eventEmitter = new events.EventEmitter()

  # Publishes docker inspect info to the eventEmitter
  publishContainerInfo = (containerId) ->
    docker.getContainer(containerId).inspect (err, data) ->
      console.log 'emit /container/inspect', containerId
      eventEmitter.emit '/container/inspect', data unless err

  publishContainerStats = ->
    docker.listContainers { all: 1 }, (err, containers) ->
      containers.forEach (containerInfo) ->
        docker.getContainer(containerInfo.Id).stats stream:1, (err, data) ->
          if err
            console.log err
          else
            chunks = ""
            data.on 'data', (chunk) -> chunks = "#{chunks}#{chunk}"
            data.on 'end', ->
              try
                parsed = JSON.parse chunks
                eventEmitter.emit '/container/stats',
                  container: containerInfo
                  stats: parsed
              catch e
                console.error 'Error during parsing JSON stats', e, "Chunks I got so far: #{chunks}"

  publishDockerInfo = ->
    docker.info (err, info) ->
      console.log 'emit /info'
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
      # if trackedEvents.indexOf(event.status) != -1
      console.log 'emit /event', event.id
      eventEmitter.emit '/event', event
      setTimeout (-> publishContainerInfo event.id), 500

    docker.getEvents (err, data) ->
      if err
        console.error('Error getting docker events: %s', err.message, err)
      data.on 'data', (chunk) ->
        lines = chunk.toString().replace(/\n$/, '').split('\n')
        lines.forEach (line) ->
          try
            if line then processDockerEvent JSON.parse(line)
          catch e
            console.error 'Error reading Docker event: %s', e.message, line


  publishDockerInfo()
  publishExistingContainers()
  # publishContainerStats()
  # setInterval publishContainerStats, 10000
  listenForEvents()

  eventEmitter # return eventEmitter so clients can register callbacks
