Docker = require('dockerode')
module.exports =

  process_existing_containers: (handler, opts) ->
    docker = new Docker(opts)
    i = 10
    console.log 'Processing all pre-existing containers'
    docker.listContainers { all: 1 }, (err, containers) ->
      containers.forEach (containerInfo) ->
        docker.getContainer(containerInfo.Id).inspect (err, data) ->
          if err and !data
            console.error 'Failed to inspect container: ', err
          else
            setTimeout (-> handler and handler(data)), i
            i = i + 10

  listen: (handler, opts) ->
    docker = new Docker(opts)
    trackedEvents = [
      'start'
      'die'
      'destroy'
    ]
    # start monitoring docker events

    handleEvent = (event, handler) ->
      setTimeout ->
        docker.getContainer(event.id).inspect (err,data) ->
          if (err)
            # console.error("Failed to inspect container: ", err)
            handler && handler(event, null, docker);
          else
            handler && handler(event, data, docker)
      , 500

    processDockerEvent = (event, stop) ->
      if trackedEvents.indexOf(event.status) != -1
        handleEvent event, handler

    docker.getEvents (err, data) ->
      if err
        console.log('Error getting docker events: %s', err.message, err)
      data.on 'data', (chunk) ->
        lines = chunk.toString().replace(/\n$/, '').split('\n')
        lines.forEach (line) ->
          try
            if line
              processDockerEvent JSON.parse(line)
          catch e
            console.log 'Error reading Docker event: %s', e.message, line
