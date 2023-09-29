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

app.get("/about", function (request, response) {
  response.render("about.handlebars");
});

app.get("/works", function (request, response) {
  response.render("works.handlebars");
});

app.get("/skills", function (request, response) {
  response.render("skills.handlebars");
});

app.get("/", function (request, response) {
  response.render("login.handlebars");
});

app.post("/login-test", (request, response) => {
  console.log("URL: ", request.url);
  var post_data = JSON.stringify(request.body);
  console.log("POST data", post, data);
  const login = request.body.firstname;
  const password = request.body.lastname;
  console.log("recieved : " + login + `/` + password);
  if (login == "admin" && password == "123321") {
    response.redirect("/about");
  } else {
    response.redirect("/");
  }
});

app.use(function (req, res) {
  res.status(404).render("404.handlebars");
});

app.listen(port, () => {
  console.log(`Server running and listening on port ${port}...`);
});
