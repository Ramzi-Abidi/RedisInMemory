const net = require("net");

class CreateServer {
    constructor() {
        this.hash = {
            "-1": "",
        };
        this.request = "";
        this.command = "";
        this.response = "";
        this.serverInfo = {
            role: "master",
            master_replid: "",
            master_repl_offset: 0,
        };
    }

    static bulkStringify(input) {
        return input ? "$" + input.length + "\r\n" + input + "\r\n" : null;
    }

    initialize() {
        return net.createServer((connection) => {
            connection.on("data", (data) => {
                this.request = data.toString().trim().split("\n");
                this.command = this.request[2]
                    .replaceAll("\r", "")
                    .toLowerCase();
                if (this.command === "ping") {
                    this.response = "+PONG\r\n";
                    this.print(connection);
                } else if (this.command === "echo") {
                    let val = this.request[4].replaceAll("\r", "");
                    this.response = `$${val.length}\r\n${val}\r\n`;
                    this.print(connection);
                } else if (this.command === "set") {
                    let key = this.request[4].replaceAll("\r", "");
                    let val = this.request[6].replaceAll("\r", "");
                    this.set(key, val);
                    this.response = `+OK\r\n`;
                    this.print(connection);
                } else if (this.command === "get") {
                    let key = this.request[4].replaceAll("\r", "");
                    this.get(connection, key);
                } else if (this.command === "info") {
                    this.serverInfo.master_replid =
                        "8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb";

                    this.response = CreateServer.bulkStringify(
                        "role:" +
                            this.serverInfo.role +
                            "\r\n" +
                            "master_replid:" +
                            this.serverInfo.master_replid +
                            "\r\n" +
                            "master_repl_offset:" +
                            this.serverInfo.master_repl_offset,
                    );
                    this.print(connection);
                } else if (this.command === "exist") {
                    let key = this.request[4].replaceAll("\r", "");
                    let val = this.exist(key);

                    this.response = this.exist(val);
                    this.response =
                        key in this.hash === true ? "+1\r\n" : "-1\r\n";
                    this.print(connection);
                } else {
                    this.response = `+${this.command}`;
                    this.print(connection);
                }
            });
        });
    }

    isSlave() {
        const isSlave =
            this.request[this.request.length - 1].replaceAll("\r", "") ===
            "replication";
        console.log(isSlave);
        return isSlave;
    }

    expire(key, time) {
        if (this.time !== -1) {
            setTimeout(() => {
                delete this.hash[key];
            }, time);
        }
    }

    exist(key) {
        return key in this.hash === true ? "1" : "-1";
    }

    set(key, val) {
        // We set the key only if it is not empty
        if (key !== "") {
            // set the new key to its value
            this.hash[key] = val;
            // check if there's a time to expire
            if (this.request.length > 7) {
                let px = this.request[8].replaceAll("\r", "");
                let time = this.request[10].replaceAll("\r", "");
                // delete key after "time"
                if (px.toLowerCase() === "px") {
                    this.expire(key, time);
                }
            }
        }
    }

    get(connection, key) {
        if (this.command === "get") {
            // if key is empty => return empty string (`$-1\r\n`)
            if (key === "") {
                this.response = `$-1\r\n`;
                this.print(connection);
            }
            if (key in this.hash) {
                // see if it's expired or not
                this.response = `$${this.hash[key].length}\r\n${this.hash[key]}\r\n`;
            } else {
                this.response = `$-1\r\n`;
            }
            this.print(connection);
        }
    }

    print(connection) {
        return connection.write(this.response.toString());
    }

    generateResponse() {}
}

module.exports = {
    CreateServer,
};
