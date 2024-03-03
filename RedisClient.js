const net = require("net");
const readline = require("readline");

class RedisClient {
    constructor() {
        this.client = new net.Socket();
    }

    initialize(PORT, HOST) {
        // Connect to your Redis server that's running on localhost, port 6379
        this.client.connect(PORT, HOST, () => {
            console.log("Connected to Redis server");

            // Send requests to server
            const request = "*1\r\n$4\r\nping\r\n";
            // sends request
            this.client.write(request);
        });

        // Handle responses from the server
        this.client.on("data", (data) => {
            console.log("Response from server:", data.toString());

            this.startReadingCommands()
        });

        // Handle connection closure
        this.client.on("close", () => {
            console.log("Connection closed");
        });
    }

    // Function to start reading commands from the user
    startReadingCommands() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "> ",
        });

        rl.prompt();

        // Read commands from the user
        rl.on("line", (line) => {
            if (line.trim() === "quit") {
                rl.close();
                client.end();
                return;
            }

            // Send command to the server
            client.write(line.trim() + "\r\n");

            // Handle responses from the server
            client.once("data", (data) => {
                console.log("Response from server:", data.toString());
                rl.prompt();
            });
        });

        rl.on("close", () => {
            console.log("Connection closed");
        });
    }
}

module.exports = {
    RedisClient,
};
