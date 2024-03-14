const colors = require("colors");
const { RedisClient } = require("./RedisClient");
const { CreateServer } = require("./Server");

const extractPortFromArg = (arr) => {
    return Number(arr[3]);
};

const extractHostFromArg = (arr) => {
    return arr[1];
};

const start = () => {
    // Create server
    const root = new CreateServer();

    // Create connection / listener to clients
    const server = root.initialize();

    // Create client
    const client = new RedisClient();

    // Extract port and host from the cmd: "node ain -h localhost -p 6379"
    const PORT = extractPortFromArg(process.argv.slice(2));
    const HOST = extractHostFromArg(process.argv.slice(2));

    // Server listens to port
    server.listen(PORT, HOST);
    console.log(`Server listens to port ${PORT}`.yellow);

    // Connecting to redis server that's connecting to PORT
    client.initialize(PORT, HOST);
};

start();
