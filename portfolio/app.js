const express = require("express"); // loads the express package
const { engine } = require("express-handlebars"); // loads handlebars for Express
const port = 8090; // defines the port
const app = express(); // creates the Express application

// defines handlebars engine
app.engine("handlebars", engine());
// defines the view engine to be handlebars
app.set("view engine", "handlebars");
// defines the views directory
app.set("views", "./views");

// define static directory "public" to access css/ and img/
app.use(express.static("public"));

/* // MODEL (DATA)
const humans = [
  { id: 0, name: "Jerome" },
  { id: 1, name: "Mira" },
  { id: 2, name: "Linus" },
  { id: 3, name: "Susanne" },
  { id: 4, name: "Jasmin" },
]; */

app.get("/", function (request, response) {
  response.render("about.handlebars");
});

app.get("/works", function (request, response) {
  response.render("works.handlebars");
});

app.get("/skills", function (request, response) {
  response.render("skills.handlebars");
});

app.use(function (req, res) {
  res.status(404).render("404.handlebars");
});

app.listen(port, () => {
  console.log(`Server running and listening on port ${port}...`);
});
