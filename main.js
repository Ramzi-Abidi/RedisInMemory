const { CreateServer } = require("./server");

const start = () => {
    const root = new CreateServer();

    const server = root.initialize();

    const PORT = root.selectPort(process.argv.splice(2));

    const HOST = "127.0.0.1";

    server.listen(PORT, HOST);
};

start();
