const net = require("net");
const readline = require("readline");

class RedisClient {
    constructor() {
        this.client = new net.Socket();
    }

    initialize(PORT, HOST) {
        // Connect to your Redis server that's running on localhost, port 6379
        this.client.connect(PORT, HOST, () => {
            console.log("Connected to Redis server".italic.green);

            this.startReadingCommands();

            // Handle responses from the redis server
            this.client.on("data", (data) => {
                console.log(
                    "Response from server: ".green,
                    this.deserialize(data),
                );
            });

            // Handle connection closure
            this.client.on("close", () => {
                console.log("Connection closed".red);
            });
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
                this.client.end();
                return;
            }

            // Send request to the redis server
            this.client.write(this.serialize(line.trim()));
        });
    }

    deserialize(data) {
        const response = data.toString();

        let deserializeResponse = null;

        // Check if it's simple string
        if (response[0] === "+") {
            deserializeResponse = response.slice(1);
        }

        return deserializeResponse;
    }

    serialize(cmd) {
        let formedCmd = cmd.toLowerCase().trim();

        console.log(formedCmd);

        if (formedCmd === "ping") {
            return "*1\r\n$4\r\nping\r\n";
        } else if (formedCmd === "set") {
            console.log("aaa");
            const key = formedCmd.split(" ")[1];
            const val = formedCmd.split(" ")[2];

            return `*3\r\n$${formedCmd.length}\r\nset\r\n$${key.length}\r\n${key}\r\n$${val.length}\r\n${val}\r\n`;
        }
        // If the cmd is unknown just send it and server will return it back!
        else {
            return `*1\r\n${formedCmd.length}\r\n${formedCmd}\r\n`;
        }
    }
}

module.exports = {
    RedisClient,
};
