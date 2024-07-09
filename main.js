const colors = require("colors");
const { RedisClient } = require("./RedisClient");
const { RedisServer } = require("./RedisServer");

const extractPortFromArg = (arr) => {
    return Number(arr[3]);
};

const extractHostFromArg = (arr) => {
    return arr[1];
};

const start = () => {
    const root = new RedisServer();

    const server = root.initialize();

    const client = new RedisClient();

    const PORT = extractPortFromArg(process.argv.slice(2));
    const HOST = extractHostFromArg(process.argv.slice(2));

    server.listen(PORT, HOST);

    console.log(`Server listens to port ${PORT}`.yellow);

    client.initialize(PORT, HOST);
};

start();
