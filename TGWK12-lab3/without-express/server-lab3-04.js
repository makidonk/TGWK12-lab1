const port = 4567;

const http = require("http");
const fs = require("fs");

const routeMap = {
  "/": "mycv-05.html",
  "/img/cvImage.jpg": "img/cvImage.jpg",
  "/css/my-styles-05.css": "css/my-styles-05.css",
};

const server = http.createServer((request, response) => {
  if (routeMap[request.url]) {
    if (request.url.slice(-4) == ".jpg") {
      response.setHeader("Content-Type", "image/jpeg");
    } else if (request.url.slice(-4) == ".css") {
      response.setHeader("Content-Type", "text/css");
    } else {
      response.setHeader("Content-Type", "text/html");
    }

    fs.readFile(routeMap[request.url], (error, data) => {
      response.statusCode = 200;
      response.write(data);
      response.end();
    });
  }
});

server.listen(port);
console.log(`The server is listening on port: ${port}`);
