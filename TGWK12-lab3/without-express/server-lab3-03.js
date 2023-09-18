const port = 3456;

const http = require("http");
const fs = require("fs");

const routeMap = {
  "/": "mycv-01.html",
  "/img/cvImage.jpg": "img/cvImage.jpg",
};

const server = http.createServer((request, response) => {
  if (routeMap[request.url]) {

    if (routeMap[request.url].slice(-4) == ".jpg") {
      response.setHeader("Content-Type", "image/jpg");
    }

    fs.readFile(routeMap[request.url], (error, data) => {
      response.write(data);
      response.end();
    });
  } else {
    response.end("<h1>Sorry, page not found</h1>");
  }

  response.statusCode = 200;
  response.setHeader("Content-Type", "text/html");
});

server.listen(port);
console.log(`The server is listening on port: ${port}`);
