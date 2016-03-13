
import "babel-polyfill";

let ns = require('node-static'),
  files = new ns.Server('.');

let http = require('http').createServer((req, res) => {
  files.serve(req, res);
});

http.listen(8080);

console.log("Server listening on localhost:8080");
