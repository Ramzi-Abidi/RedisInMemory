const net = require("net");

const hash = {
    "-1": "",
};

const expire = (key, time) => {
    if (time) {
        setTimeout(() => {
            delete hash[key];
        }, time);
    }
};

const set = () => {};

const get = () => {

};

const server = net.createServer((connection) => {
    // Handle connection
    connection.on("data", (data) => {
        let request = data.toString().trim().split("\n");
        console.log("req", request);

        let command = request[2].replaceAll("\r", "").toLowerCase();
        console.log("command", command);
        if (command === "ping") {
            connection.write("+PONG\r\n");
        } else if (command === "echo") {
            let val = request[4].replaceAll("\r", "");
            let response = `$${val.length}\r\n${val}\r\n`;
            connection.write(response);
        } else if (command === "set") {
            let key = request[4].replaceAll("\r", "");
            // We set the key only if it is not empty
            if (key !== "") {
                let value = request[6].replaceAll("\r", "");
                // set the new key to its value
                hash[key] = value;
                // check if there's a time to expire
                if (request.length > 7) {
                    let px = request[8].replaceAll("\r", "");
                    let time = request[10].replaceAll("\r", "");
                    // delete key after "time"
                    if (px.toLowerCase() === "px") {
                        expire(key, time);
                    }
                }
                connection.write(`+OK\r\n`);
            }
        } else if (command === "get") {
            let key = request[4].replaceAll("\r", "");

            // if key is empty => return empty string
            if (key === "") {
                connection.write(`$-1\r\n""\r\n`);
            }

            if (key in hash) {
                // see if it's expired or not
                connection.write(`$${hash[key].length}\r\n${hash[key]}\r\n`);
            } else {
                connection.write(`$-1\r\n""\r\n`);
            }
            
        }
    });
});

server.listen(6379, "127.0.0.1");
