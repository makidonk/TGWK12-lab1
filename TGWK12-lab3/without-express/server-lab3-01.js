const http = require("http");
const port = 1234;
const server = http.createServer(function (req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello World!");
});

server.listen(port, function () {
  console.log(`server running and listening on port ${port} ...`);
});
