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

            this.client.on("data", (data) => {
                console.log(
                    "Response from Redis server: ".green,
                    this.deserialize(data),
                );
            });

            this.client.on("close", () => {
                console.log("Connection closed".red);
            });
        });
    }

    startReadingCommands() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "> ",
        });

        rl.prompt();

        rl.on("line", (line) => {
            if (line.trim() === "quit") {
                rl.close();
                this.client.end();
                return;
            }

            this.client.write(this.serialize(line.trim()));
        });
    }

    deserialize(data) {
        let deserializeResponse = null;
        const response = data.toString();

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
                return `*3\r\n$${formedCmd.length}\r\nset\r\n$${key.length}\r\n${key}\r\n$${val.length}\r\n${val}\r\n`;

            case "get":
            case "exist":
            case "del":
            case "inc":
            case "dec":
                return `*2\r\n$${formedCmd.length}\r\n${formedCmd}\r\n$${key.length}\r\n${key}\r\n`;

            default:
                return `*1\r\n${formedCmd.length}\r\n${formedCmd}\r\n`;
        }
    }
}

module.exports = {
    RedisClient,
};
