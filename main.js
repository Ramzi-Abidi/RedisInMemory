const { RedisClient } = require("./RedisClient");
const { CreateServer } = require("./Server");

const extractPortFromArg = (arr) => {
    return Number(arr[3]);
};

const extractHostFromArg = (arr) => {
    return arr[1];
};

const start = () => {
    // create server
    const root = new CreateServer();

    // create connection / listener to clients
    const server = root.initialize();

    const client = new RedisClient();

    const PORT = extractPortFromArg(process.argv.slice(2));
    const HOST = extractHostFromArg(process.argv.slice(2));

    // server listens to port
    server.listen(PORT, HOST);
    console.log(`server listens to port ${PORT}`);

    // initialize client
    client.initialize(PORT, HOST);

};

start();
