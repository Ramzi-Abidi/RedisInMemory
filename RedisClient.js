const net = require("net");
const readline = require("readline");

class RedisClient {
    constructor() {
        this.client = new net.Socket();
    }

    initialize(PORT, HOST) {
        // Connect to your Redis server that's running on localhost, port 6379
        this.client.connect(PORT, HOST, () => {
            console.log("Connected to Redis server".green.italic);

            this.startReadingCommands();

            // Handle responses from the redis server
            this.client.on("data", (data) => {
                console.log(
                    "Response from Redis server: ".green,
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
        let deserializeResponse = null;
        const response = data.toString();

        // Check if it's simple string
        if (response[0] === "+") {
            deserializeResponse = response.slice(1);
        } else if (response[0] === "$") {
            let val = response.replaceAll("\r\n", " ").split(" ")[1];
            deserializeResponse = val;
        }
        return deserializeResponse;
    }

    static log(str) {
        console.log("log client: ".yellow, str);
    }

    serialize(cmd) {
        let cmdToBeSerialize = cmd.toLowerCase().trim() + " ";
        let formedCmd = cmdToBeSerialize.split(" ")[0].toLowerCase();

        // RedisClient.log("to be serialize " + formedCmd);

        const commandParts = cmdToBeSerialize.split(" ");
        const key = commandParts[1];
        const val = commandParts[2];

        switch (formedCmd) {
            case "echo":
                const echoValue = key;
                return `*1\r\n$${formedCmd.length}\r\necho\r\n$${echoValue.length}\r\n${echoValue}\r\n`;

            case "ping":
                return "*1\r\n$4\r\nping\r\n";

            case "set":
                // RedisClient.log("key and val", key, val);
                return `*3\r\n$${formedCmd.length}\r\nset\r\n$${key.length}\r\n${key}\r\n$${val.length}\r\n${val}\r\n`;

            case "get":
            case "exist":
            case "del":
            case "inc":
            case "dec":
                return `*2\r\n$${formedCmd.length}\r\n${formedCmd}\r\n$${key.length}\r\n${key}\r\n`;

            default:
                // If the cmd is unknown just send it and the server will return it back!
                return `*1\r\n${formedCmd.length}\r\n${formedCmd}\r\n`;
        }
    }
}

module.exports = {
    RedisClient,
};
