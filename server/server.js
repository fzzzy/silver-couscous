
import "babel-polyfill";
import { Server } from "engine.io";
import { readdir, realpathSync, readlinkSync } from "fs";
import { connect } from "net";
import { createServer } from "http";
import { dirname, join } from "path";

let express = require("express"),
  morgan = require("morgan"),
  app = express(),
  server = createServer(app).listen(8080),
  engine = Server();

console.log("Server listening on localhost:8080");

let clientdir = join(dirname(__dirname), "client");
console.log("clientdir", clientdir);

//app.use(morgan('combined'));

app.get("/scripts/", function(req, res) {
  readdir(join(clientdir, "scripts"), (err, result) => {
    if (err) {
      res.json({err: err});
    } else {
      res.json({scripts: result});
    }
  });
});

app.use(express.static(clientdir, {etag: false}));

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
