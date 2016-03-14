
import "babel-polyfill";
import { Server } from "node-static";
import { attach } from "engine.io";
import { connect } from "net";

let files = new Server(".");

let http = require("http").createServer((req, res) => {
  files.serve(req, res);
});

function openBridge() {
  return new Promise((resolve, reject) => {
    let bridge = connect(7777, "localhost");
    bridge.on("connect", () => {
      resolve(bridge);
    });
  });
}

async function handleConnection(websock) {
  let bridge = await openBridge();
  bridge.setEncoding("utf8");

  websock.on("message", function (data) {
    bridge.write(data + "\r\n");
  });

  bridge.on("data", function (data) {
    websock.send(data);
  });

  bridge.on("end", function () {
    websock.close();
  });

  websock.on("close", function () {
    bridge.end();
  });
}

attach(http).on("connection", handleConnection);

http.listen(8080);

console.log("Server listening on localhost:8080");
