const assert  = require('assert');
const chai    = require('chai')
const td      = require('testdouble');
const expect   = chai.expect;

const realMqtt = td.replace('mqtt');
const mqtt     = require('../src/mqtt.js');

const config = {
  url: 'mqtt://host',
  user: 'username',
  pass: 'passwd123',
  topicNs: '/docker/'
}
var client, myMqtt, consol, captor;

describe('mqtt', () => {
  beforeEach(() => {
    client = td.object(['on', 'publish'])
    consol = td.object({log: () => {}, error: () => {}})
    captor = td.matchers.captor()
    td.when(realMqtt.connect('mqtt://host', {username: 'username', password: 'passwd123'})).thenReturn(client)
    myMqtt = mqtt(config, consol);
  });
  it('should return an mqtt instance with publish capabilities', () => {
    expect(myMqtt.publish).to.be.a('function');
    myMqtt.publish('myTopic', {some:'data'});
    td.verify(client.publish('/docker/myTopic', '{"some":"data"}', td.matchers.anything(), td.matchers.anything()));
  });
  it('should log when an error occurs while publishing to the mqtt server', () => {
    myMqtt.publish('myTopic', {});
    td.verify(client.publish(td.matchers.anything(), td.matchers.anything(), td.matchers.anything(), captor.capture()));
    captor.value('err');
    td.verify(consol.error('/docker/myTopic', 'err'));
  })
  it('should log when connected to the server', () => {
    td.verify(client.on('connect', captor.capture()));
    captor.value();
    td.verify(consol.log('Connected to', config.url));
  });
  it('should log when an error occurs', () => {
    td.verify(client.on('error', captor.capture()));
    captor.value('myerr');
    td.verify(consol.error('An error occured', 'myerr'));
  });
  it('should log when the connection to the mqtt server is closed', () => {
    td.verify(client.on('close', captor.capture()));
    captor.value();
    td.verify(consol.log('Connection closed'));
  });
});
