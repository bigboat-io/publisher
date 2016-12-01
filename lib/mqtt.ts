var mqtt;

mqtt = require("mqtt");

export default (mqttConfig) => {
    var client;
    client = mqtt.connect(mqttConfig.url);
    client.on("connect", () => console.log("Connected to", mqttConfig.url));

    client.on("error", (err) => console.error("An error occured", err));
    client.on("close", () => console.log("Connection closed"));

    return {
        publish: (topic, data) =>
          client.publish(mqttConfig.topicNs + topic, JSON.stringify(data), {}, (err) => {
              if (err) {
                  console.error(mqttConfig.topicNs + topic, err);
              }
          })
    };
};
