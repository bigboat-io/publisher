#!/bin/bash

docker run --net=host --name nodered -d -p 1880:1880 -e FLOWS=mqttflow.json -v $PWD/mqttflow.json:/data/mqttflow.json nodered/node-red-docker:slim
