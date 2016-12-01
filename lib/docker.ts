const events = require("events");
const Docker = require("dockerode");

export default (opts) => {
    var docker, eventEmitter;
    docker = new Docker(opts);
    eventEmitter = new events.EventEmitter();

    // Publishes docker inspect info to the eventEmitter
    function publishContainerInfo(containerId) {
        docker.getContainer(containerId).inspect((err, data) => {
            console.log("emit /container/inspect", containerId);
            if (!err) {
                eventEmitter.emit("/container/inspect", data);
            }
        });
    }

    function publishContainerStats() {
        docker.listContainers({
            all: 1
        }, (err, containers) => containers.forEach((containerInfo) => docker.getContainer(containerInfo.Id).stats({
                    stream: 1
                }, (err, data) => {
                    var chunks;
                    if (err) {
                        console.log(err);
                    } else {
                        chunks = "";
                        data.on("data", (chunk) => chunks = chunks + chunk);
                        data.on("end", () => {
                            var e, parsed;
                            try {
                                parsed = JSON.parse(chunks);
                                eventEmitter.emit("/container/stats", {
                                    container: containerInfo,
                                    stats: parsed
                                });
                            } catch (_error) {
                                e = _error;
                                e = _error;
                                e = _error;
                                e = _error;
                                console.error("Error during parsing JSON stats", e, "Chunks I got so far: " + chunks);
                            }
                        });
                    }
                })));
    }

    function publishDockerInfo() {
        return docker.info((err, info) => {
            console.log("emit /info");
            eventEmitter.emit("/info", info);
        });
    }

    function publishExistingContainers() {
        var i;
        i = 10;
        return docker.listContainers({
            all: 1
        }, (err, containers) => containers.forEach((containerInfo) => {
                setTimeout((() => publishContainerInfo(containerInfo.Id)), i);
                i = i + 10;
            }));
    }

    function listenForEvents() {
        var trackedEvents;
        trackedEvents = ["start", "die", "destroy", "pull"];

        function processDockerEvent(event) {
            // if trackedEvents.indexOf(event.status) != -1
            console.log("emit /event", event.id);
            eventEmitter.emit("/event", event);
            setTimeout((() => publishContainerInfo(event.id)), 500);
        }

        return docker.getEvents((err, data) => {
            if (err) {
                console.error("Error getting docker events: %s", err.message, err);
            }
            return data.on("data", (chunk) => {
                var lines;
                lines = chunk.toString().replace(/\n$/, "").split("\n");
                lines.forEach((line) => {
                    var e;
                    try {
                        if (line) {
                            processDockerEvent(JSON.parse(line));
                        }
                    } catch (_error) {
                        e = _error;
                        console.error("Error reading Docker event: %s", e.message, line);
                    }
                });
            });
        });
    }

    publishDockerInfo();
    publishExistingContainers();
    // publishContainerStats()
    // setInterval publishContainerStats, 10000
    listenForEvents();

    return eventEmitter;  // return eventEmitter so clients can register callbacks
};
