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
            role: "",
        };
    }

    selectPort(args) {
        console.log("17", args);

        let port = 6379;
        if (args) {
            if (args[0] && args[0] == "--port") {
                port = args[1] && args[1];
            }
            if (args[2] && args[2] == "--replicaof") {
                this.serverInfo.role = "slave";
            } else {
                this.serverInfo.role = "master";
            }
        }
        return port;
    }

    initialize() {
        return net.createServer((connection) => {
            connection.on("data", (data) => {
                this.request = data.toString().trim().split("\n");
                this.command = this.request[2]
                    .replaceAll("\r", "")
                    .toLowerCase();

                console.log("request", this.request);

                if (this.command === "ping") {
                    this.response = "+PONG\r\n";
                    this.print(connection);
                } else if (this.command === "echo") {
                    let val = this.request[4].replaceAll("\r", "");
                    this.response = `$${val.length}\r\n${val}\r\n`;
                    this.print(connection);
                } else if (this.command === "set") {
                    let key = this.request[4].replaceAll("\r", "");
                    this.set(key);
                    this.response = `+OK\r\n`;
                    this.print(connection);
                } else if (this.command === "get") {
                    let key = this.request[4].replaceAll("\r", "");
                    this.get(connection, key);
                } else if (this.command === "info") {
                    // check if its master or slave
                    console.log("cmd", this.command);
                    // '$' + ('role:' + serverInfo.role).length;
                    // return ('$' + ('role:' + serverInfo.role).length + '\r\n' + 'role:' + serverInfo.role + '\r\n')
                    this.response = `$${this.serverInfo.role.length + 5}\r\nrole:${this.serverInfo.role}\r\n`;
                    console.log("64", this.response);
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

    set(key) {
        // We set the key only if it is not empty
        if (key !== "") {
            let value = this.request[6].replaceAll("\r", "");
            // set the new key to its value
            this.hash[key] = value;
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
            // if key is empty => return empty string
            if (key === "") {
                this.response = `$-1\r\n""\r\n`;
                this.print(connection);
            }

            if (key in this.hash) {
                // see if it's expired or not
                this.response = `$${this.hash[key].length}\r\n${this.hash[key]}\r\n`;
                this.print(connection);
            } else {
                this.response = `$-1\r\n""\r\n`;
                this.print(connection);
            }
        }
    }

    print(connection) {
        connection.write(this.response);
    }

    generateResponse() {}
}

module.exports = {
    CreateServer,
};

// const server = net.createServer((connection) => {
//     // Handle connection
//     connection.on("data", (data) => {
//         let request = data.toString().trim().split("\n");
//         console.log("req", request);

//         let command = request[2].replaceAll("\r", "").toLowerCase();
//         console.log("command", command);
//         if (command === "ping") {
//             connection.write("+PONG\r\n");
//         } else if (command === "echo") {
//             let val = request[4].replaceAll("\r", "");
//             let response = `$${val.length}\r\n${val}\r\n`;
//             connection.write(response);
//         } else if (command === "set") {
//             let key = request[4].replaceAll("\r", "");
//             // We set the key only if it is not empty
//             if (key !== "") {
//                 let value = request[6].replaceAll("\r", "");
//                 // set the new key to its value
//                 hash[key] = value;
//                 // check if there's a time to expire
//                 if (request.length > 7) {
//                     let px = request[8].replaceAll("\r", "");
//                     let time = request[10].replaceAll("\r", "");
//                     // delete key after "time"
//                     if (px.toLowerCase() === "px") {
//                         expire(key, time);
//                     }
//                 }
//                 connection.write(`+OK\r\n`);
//             }
//         } else if (command === "get") {
//             let key = request[4].replaceAll("\r", "");

//             // if key is empty => return empty string
//             if (key === "") {
//                 connection.write(`$-1\r\n""\r\n`);
//             }

//             if (key in hash) {
//                 // see if it's expired or not
//                 connection.write(`$${hash[key].length}\r\n${hash[key]}\r\n`);
//             } else {
//                 connection.write(`$-1\r\n""\r\n`);

//             }
//         }
//     });
// });
