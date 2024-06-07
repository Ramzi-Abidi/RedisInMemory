const net = require("net");

class RedisServer {
    constructor() {
        this.hash = {};
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

    isNumber(key) {
        const value = this.hash[key];
        return !isNaN(value);
    }

    initialize() {
        return net.createServer((connection) => {
            connection.on("data", (data) => {
                this.request = data.toString().trim().split("\n");
                this.command = this.request[2]
                    .replaceAll("\r", "")
                    .toLowerCase();
                switch (this.command) {
                    case "ping":
                        this.response = "+PONG\r\n";
                        this.print(connection);
                        break;
                    case "echo":
                        let echoVal = this.request[4].replaceAll("\r", "");
                        this.response = `$${echoVal.length}\r\n${echoVal}\r\n`;
                        this.print(connection);
                        break;
                    case "set":
                        let setKey = this.request[4].replaceAll("\r", "");
                        let setVal = this.request[6].replaceAll("\r", "");
                        this.set(setKey, setVal);
                        this.response = "+OK\r\n";
                        this.print(connection);
                        break;
                    case "get":
                        let getKey = this.request[4].replaceAll("\r", "");
                        let getKeyExist = this.exist(getKey);
                        if (getKeyExist === "+1") {
                            this.get(connection, getKey);
                        } else {
                            this.response = `${getKeyExist}\r\n`;
                            this.print(connection);
                        }
                        break;
                    case "info":
                        this.serverInfo.master_replid =
                            "8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb";
                        this.response = Server.bulkStringify(
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
                        break;
                    case "exist":
                        let existKey = this.request[4].replaceAll("\r", "");
                        let keyExist = this.exist(existKey);
                        this.response = `${keyExist}\r\n`;
                        console.log(this.response);
                        this.print(connection);
                        break;
                    case "del":
                        let delKey = this.request[4].replaceAll("\r", "");
                        let delKeyExist = this.exist(delKey);
                        this.response = `${delKeyExist}\r\n`;
                        if (delKeyExist === "1") {
                            this.response = `+${delKeyExist}\r\n`;
                            delete this.hash[delKey];
                        }
                        this.print(connection);
                        break;
                    case "inc":
                        let incKey = this.request[4].replaceAll("\r", "");
                        let incKeyExist = this.exist(incKey);
                        if (incKeyExist === "-1") {
                            this.response = `${incKeyExist}\r\n`;
                        } else if (this.isNumber(incKey)) {
                            this.hash[incKey]++;
                            this.response = "+OK\r\n";
                        }
                        this.print(connection);
                        break;
                    case "dec":
                        let decKey = this.request[4].replaceAll("\r", "");
                        let decKeyExist = this.exist(decKey);
                        if (decKeyExist === "-1") {
                            this.response = `${decKeyExist}\r\n`;
                        } else if (this.isNumber(decKey)) {
                            this.hash[decKey]--;
                            this.response = "+OK\r\n";
                        }
                        this.print(connection);
                        break;
                    default:
                        this.response = `+${this.command}`;
                        this.print(connection);
                        break;
                }
            });
        });
    }

    isSlave() {
        const isSlave =
            this.request[this.request.length - 1].replaceAll("\r", "") ===
            "replication";
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
        return key in this.hash === true ? "+1" : "-1";
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
}

module.exports = {
    RedisServer,
};
