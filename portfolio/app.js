const express = require("express"); // loads the express package
const { engine } = require("express-handlebars"); // loads handlebars for Express
const port = 8090; // defines the port
const app = express(); // creates the Express application
const session = require("express-session");
const bodyParser = require("body-parser"); // Import body-parser
const cookieParser = require("cookie-parser");
const connectSqlite3 = require("connect-sqlite3");
const sqlite3 = require("sqlite3");
const SQLiteStore = connectSqlite3(session);
// defines handlebars engine
app.engine("handlebars", engine());
// defines the view engine to be handlebars
app.set("view engine", "handlebars");
// defines the views directory
app.set("views", "./views");
// define static directory "public" to access css/ and img/
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = new sqlite3.Database("portfolio.db");

app.use(
  session({
    store: new SQLiteStore({ db: "session-db.db" }),
    saveUninitialized: false,
    resave: false,
    secret: "Secret1234message1234",
  })
);

app.get("/", function (request, response) {
  console.log("SESSION: ", request.session);
  const model = {
    isLoggedIn: request.session.isLoggedIn,
    name: request.session.name,
    isAdmin: request.session.isAdmin,
  };
  response.render("about.handlebars", model);
});

app.get("/projects", function (request, response) {
  const model = {
    isLoggedIn: request.session.isLoggedIn,
    name: request.session.name,
    isAdmin: request.session.isAdmin,
  };
  response.render("projects.handlebars", model);
});

app.get("/skills", function (request, response) {
  const model = {
    isLoggedIn: request.session.isLoggedIn,
    name: request.session.name,
    isAdmin: request.session.isAdmin,
  };
  response.render("skills.handlebars", model);
});

app.get("/login", function (request, response) {
  const model = {
    isLoggedIn: request.session.isLoggedIn,
    name: request.session.name,
    isAdmin: request.session.isAdmin,
  };
  response.render("login.handlebars", model);
});

app.post(`/login`, (request, response) => {
  console.log("URL: ", request.url);
  //doesnt work without this:
  var post_data = JSON.stringify(request.body);
  console.log("POST data", post_data);

  const login = request.body.un;
  const password = request.body.pw;
  console.log("recieved : " + login + `/` + password);
  if (login === "admin" && password === "1") {
    console.log("admin is logged in!");
    request.session.isAdmin = true;
    request.session.isLoggedIn = true;
    request.session.name = "admin";
    response.redirect("/");
  } else {
    console.log("wrong username or password");
    request.session.isAdmin = false;
    request.session.isLoggedIn = false;
    request.session.name = "";
    response.redirect("/login");
  }
});

//renders the projects route viwew
app.get("/projects", (request, response) => {
  db.all("SELECT * FROM projects", function (error, projects) {
    if (error) {
      const model = {
        dbError: true,
        theError: error,
        projects: [],
        isLoggedIn: request.session.isLoggedIn,
        name: request.session.name,
        isAdmin: request.session.isAdmin,
      };

      res.render("projects.handlebars", model);
    } else {
      const model = {
        dbError: false,
        theError: "",
        projects: projects,
        isLoggedIn: request.session.isLoggedIn,
        name: request.session.name,
        isAdmin: request.session.isAdmin,
      };
      res.render("projects.handlebars", model);
    }
  });
});

//delete a project
app.get(`/projects/delete/id`, (request, response) => {
  const id = request.params.id;
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    db.run(
      "DELETE FROM projects WHERE pid=?",
      [id],
      function (error, projects) {
        if (error) {
          const model = {
            dbError: true,
            theError: error,
            isLoggedin: request.session.isLoggedIn,
            name: request.session.name,
            isAdmin: request.session.isAdmin,
          };
          response.render("projects.handlebars", model);
        } else {
          const model = {
            dbError: false,
            theError: "",
            isLoggedin: request.session.isLoggedIn,
            name: request.session.name,
            isAdmin: request.session.isAdmin,
          };
          response.render("projects.handlebars", model);
        }
      }
    );
  } else {
    response.redirect("/login");
  }
});

db.get(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='projects'",
  (error, row) => {
    if (error) {
      console.log("error:", error);
    } else if (!row) {
      // The "projects" table does not exist, create it

      db.run(
        "CREATE TABLE projects (pid INTEGER PRIMARY KEY, pname TEXT NOT NULL, pyear INTEGER NOT NULL, pdesc TEXT NOT NULL, ptype TEXT NOT NULL, pimgurl TEXT NOT NULL)",
        (error) => {
          if (error) {
            console.log("error:", error);
          } else {
            console.log("---> table projects created");
            const projects = [
              {
                pid: "1",
                pname: "Pippi Långstrum Illustration",
                pyear: 2022,
                pdesc: "This is an illustration of pippi",
                ptype: "illustrator",
                purl: "public/img/Me.jpg",
              },
              {
                pid: "2",
                pname: "djur",
                pyear: 2022,
                pdesc: "This is an illustration of an animal",
                ptype: "illustrator",
                purl: "public/img/Me.jpg",
              },
              {
                pid: "3",
                pname: "Catch the students JavaScript game",
                pyear: 2023,
                pdesc: "This is a game made with javascript",
                ptype: "Code",
                purl: "public/img/Me.jpg",
              },
            ];
            projects.forEach((oneProject) => {
              db.run(
                "INSERT INTO projects (pid, pname, pyear, pdesc, ptype, purl) VALUES (?,?,?,?,?,?)",
                [
                  oneProject.pid,
                  oneProject.pname,
                  oneProject.pyear,
                  oneProject.pdesc,
                  oneProject.ptype,
                  oneProject.pimgurl,
                ],
                (error) => {
                  if (error) {
                    console.log("error:", error);
                  } else {
                    console.log("line added to the projects table");
                  }
                }
              );
            });
          }
        }
      );
    }
  }
);

/* // MODEL (DATA)
const humans = [
  { id: 0, name: "Jerome" },
  { id: 1, name: "Mira" },
  { id: 2, name: "Linus" },
  { id: 3, name: "Susanne" },
  { id: 4, name: "Jasmin" },
]; */
/* 

//lecture login
passport.use(new localStorage(
  function(username, password, done) {
    //verify username and password
  }
));

app.get("/", (request,response) => {
  if (request.isAuthenticated() {

  })
});

const bcrypt = require("bcrypt");
const hash = bcrypt.hashSync(password,10);

app.get("/" (request,response) => {
  if (request.session.user) {
    response.render("index", (user: {request.session.user}))
  }
});




//sessions with handlebars
app.get("/" (request,response) => {

    response.render("index",{user: request.session.user})
  
});
//cookies res.cookie(name, value, options)
res.cookie("theme", "dark",{ maxAge: 9000, httpOnlt: true});

const cookieParser = require("cookie-parser");

//cookie w handlebars get the cookie and send to handlebars
app.get("/" (request,response) => {
  response.render("index", {theme: request.cookies.theme})
});

const isAuthenticated = (req, res, next) => {
if (req.isAuthenticated()) {
next();
} else {
res.redirect('/login');
}
};

app.get('/secret', isAuthenticated, (req, res) => {
res.render('secret');
});

//in handlebars
{{#if user}}
h1 hallo {{user.username}}
{{else}}
h1 hello guest
{{/if}}





*/
app.use(function (req, res) {
  res.status(404).render("404.handlebars");
});

app.listen(port, () => {
  console.log(`Server running and listening on port ${port}...`);
});
