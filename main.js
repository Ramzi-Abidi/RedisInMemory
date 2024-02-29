const { CreateServer } = require("./server");

// const initializeServer = (args) => {
//     let port = 6379;
//     if (args) {
//         if (args[0] && args[0] == "--port") {
//             port = args[1] && args[1];
//         }
//         if (args[2] && args[2] == "--replicaof") {
//             serverInfo.role = "slave";
//         } else {
//             serverInfo.role = "master";
//             1;
//         }
//     }
//     console.log("Listening on port: " + port);
//     // server.listen(port);
// };

const start = () => {
    const root = new CreateServer();

    const server = root.initialize();

    const PORT = root.selectPort(process.argv.splice(2));

    const HOST = "127.0.0.1";

    server.listen(PORT, HOST);
};

start();
