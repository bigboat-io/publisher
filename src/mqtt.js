const mqtt = require('mqtt')

module.exports = (mqttConfig, consol=console) => {
  var client
  client = mqtt.connect(mqttConfig.url, {
    username: mqttConfig.user,
    password: mqttConfig.pass
  })
  client.on('connect', () => { consol.log('Connected to', mqttConfig.url) })

  client.on('error', (err) => { consol.error('An error occured', err) })
  client.on('close', () => { consol.log('Connection closed') })

  return {
    publish: (topic, data) =>
      client.publish(mqttConfig.topicNs + topic, JSON.stringify(data), {}, (err) => {
        if (err) {
          consol.error(mqttConfig.topicNs + topic, err)
        }
      })
  }
}
