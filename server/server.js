
import "babel-polyfill";
import { Server } from "engine.io";
import { connect } from "net";
import { createServer } from "http";

let express = require("express"),
  app = express(),
  server = createServer(app).listen(8080),
  engine = Server();
console.log("Server listening on localhost:8080");

app.use(express.static(__dirname + "static"));

engine.attach(server);
engine.on("connection", handleConnection);

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
