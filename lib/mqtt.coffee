mqtt    = require 'mqtt'

module.exports = (mqttConfig) ->
  client = mqtt.connect mqttConfig.url
  client.on 'connect', ->
    console.log 'Connected to', mqttConfig.url

  client.on 'error', (err) -> console.error 'An error occured', err
  client.on 'close', -> console.log 'Connection closed'

  publish: (topic, data) ->
    client.publish "#{mqttConfig.topicNs}#{topic}", JSON.stringify data, {}, (err) ->
      console.error "#{mqttConfig.topicNs}#{topic}", err if err
