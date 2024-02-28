const { CreateServer } = require("./server");

const start = () => {
    const root = new CreateServer();

    const server = root.initialize();

    const PORT = process.argv.slice(3)[0] || 6379;
    const HOST = "127.0.0.1";

    server.listen(PORT, HOST);
};

start();
