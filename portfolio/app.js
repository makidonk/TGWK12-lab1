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

app.get("/projects", (request, response) => {
  db.all("SELECT * FROM projects", function (error, theProjects) {
    if (error) {
      const model = {
        dbError: true,
        theError: error,
        projects: [],
        isLoggedIn: request.session.isLoggedIn,
        name: request.session.name,
        isAdmin: request.session.isAdmin,
      };
      // renders the page with the model
      response.render("projects.handlebars", model);
    } else {
      const model = {
        dbError: false,
        theError: "",
        projects: theProjects,
        isLoggedIn: request.session.isLoggedIn,
        name: request.session.name,
        isAdmin: request.session.isAdmin,
      };
      // renders the page with the model
      response.render("projects.handlebars", model);
    }
  });
});

app.get("/skills", (request, response) => {
  db.all("SELECT * FROM skills", function (error, theSkills) {
    if (error) {
      const model = {
        dbError: true,
        theError: error,
        skills: [],
        isLoggedIn: request.session.isLoggedIn,
        name: request.session.name,
        isAdmin: request.session.isAdmin,
      };
      // renders the page with the model
      response.render("skills.handlebars", model);
    } else {
      const model = {
        dbError: false,
        theError: "",
        skills: theSkills,
        isLoggedIn: request.session.isLoggedIn,
        name: request.session.name,
        isAdmin: request.session.isAdmin,
      };
      // renders the page with the model
      response.render("skills.handlebars", model);
    }
  });

  app.get("/login", (request, response) => {
    const model = {
      isLoggedIn: request.session.isLoggedIn,
      name: request.session.name,
      isAdmin: request.session.isAdmin,
    };
    response.render("login.handlebars", model);
  });
});

app.get("/logout", function (request, response) {
  request.session.destroy((error) => {
    console.log("error while destroying session: ", error);
  });

  console.log("logged out");
  response.redirect("/");
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

//ADD THE TABLES
db.run(
  "CREATE TABLE projects (pid INTEGER PRIMARY KEY, pname TEXT NOT NULL, pyear INTEGER NOT NULL, pdesc TEXT NOT NULL, ptype TEXT NOT NULL, pimgURL TEXT NOT NULL)",
  (error) => {
    if (error) {
      // tests error: display error
      console.log("ERROR: ", error);
    } else {
      // tests error: no error, the table has been created
      console.log("---> Table projects created!");

      const projects = [
        {
          id: "1",
          name: "Pippi Långstrum Illustration",
          year: 2022,
          desc: "This is an illustration of pippi",
          type: "illustrator",
          url: "/img/Me.jpg",
        },
        {
          id: "2",
          name: "djur",
          year: 2022,
          desc: "This is an illustration of an animal",
          type: "illustrator",
          url: "/img/Me.jpg",
        },
        {
          id: "3",
          name: "Catch the students JavaScript game",
          year: 2023,
          desc: "This is a game made with javascript",
          type: "Programming",
          url: "/img/Me.jpg",
        },
      ];
      // inserts projects
      projects.forEach((oneProject) => {
        db.run(
          "INSERT INTO projects (pid, pname, pyear, pdesc, ptype, pimgURL) VALUES (?, ?, ?, ?, ?, ?)",
          [
            oneProject.id,
            oneProject.name,
            oneProject.year,
            oneProject.desc,
            oneProject.type,
            oneProject.url,
          ],
          (error) => {
            if (error) {
              console.log("ERROR: ", error);
            } else {
              console.log("Line added into the projects table!");
            }
          }
        );
      });
    }
  }
);

//new project
app.get("/projects/new", function (request, response) {
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    const model = {
      isLoggedIn: request.session.isLoggedIn,
      name: request.session.name,
      isAdmin: request.session.isAdmin,
    };
    response.render("newProject.handlebars", model);
  } else {
    response.redirect("/login");
  }
});

app.post("/projects/new", (request, response) => {
  const newp = [
    request.body.projname,
    request.body.projyear,
    request.body.projdesc,
    request.body.projtype,
    request.body.projimg,
  ];
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    db.run(
      "INSERT INTO projects (pname, pyear, pdesc, ptype, pimgURL) VALUES (?,?,?,?,?)",
      newp,
      (error) => {
        if (error) {
          console.log("ERROR:", error);
        } else {
          console.log("line added to projects table");
        }
        response.redirect("/projects");
      }
    );
  } else {
    response.redirect("/login");
  }
});

//delete a project
app.get(`/projects/delete/:id`, (request, response) => {
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

app.post("/projects/update/:id", (request, response) => {
  const id = request.params.id;
  const newp = [
    request.body.projectName,
    request.body.projectImg,
    request.body.projectDesc,
    request.body.projectDate,
    request.body.userFK,
    id,
  ];
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    db.run(
      "UPDATE projects SET projectName=?, projectImg=?, projectDesc=?, projectDate=?, userFK=?",
      newp,
      (error) => {
        if (error) {
          console.log("ERROR: ", error);
        } else {
          console.log("Project updated!");
        }
        response.redirect("/projects");
      }
    );
  } else {
    response.redirect("/login");
  }
});

app.get("/projects/modify/:id", (request, response) => {
  const id = request.params.id;
  db.get(
    "SELECT * FROM projects WHERE pid=?",
    [id],
    function (error, theProjects) {
      if (error) {
        console.log("ERROR:", error);
        const model = {
          dbError: true,
          theError: error,
          project: {},
          isLoggedIn: request.session.isLoggedIn,
          name: request.session.name,
          isAdmin: request.session.isAdmin,
        };
        response.render("modifyProject.handlebars", model);
      } else {
        const model = {
          dbError: false,
          theError: "",
          project: theProjects,
          isLoggedIn: request.session.isLoggedIn,
          name: request.session.name,
          isAdmin: request.session.isAdmin,
          helpers: {
            theTypeI(value) {
              return value == "Illustrator";
            },
            theTypePh(value) {
              return value == "Photoshop";
            },
            theTypePr(value) {
              return value == "Programming";
            },
            theTypeIP(value) {
              return value == "Illustrator and Programming";
            },
            theTypeInD(value) {
              return value == "InDesign";
            },
            theTypeInDI(value) {
              return value == "InDesign and Illustrator";
            },
          },
        };
        response.render("modifyProject.handlebars", model);
      }
    }
  );
});

app.post("/projects/modify/:id", (request, response) => {
  const id = request.params.id;
  const newp = [
    request.body.projname,
    request.body.projyear,
    request.body.projdesc,
    request.body.projtype,
    request.body.projimg,
    id,
  ];
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    db.run(
      "UPDATE projects SET pname=?, pyear=?, pdesc=?, ptype=?, pimgURL=? WHERE pid=?",
      newp,
      (error) => {
        if (error) {
          console.log("ERROR: ", error);
        } else {
          console.log("Project updated!");
        }
        response.redirect("/projects");
      }
    );
  } else {
    response.redirect("/login");
  }
});

// creates skills projects at startup
db.run(
  "CREATE TABLE skills (sid INTEGER PRIMARY KEY, sname TEXT NOT NULL, sdesc TEXT NOT NULL, stype TEXT NOT NULL)",
  (error) => {
    if (error) {
      // tests error: display error
      console.log("ERROR: ", error);
    } else {
      // tests error: no error, the table has been created
      console.log("---> Table skills created!");

      const skills = [
        {
          id: "1",
          name: "Adobe Illustrator",
          type: "Design",
          desc: "Designing in Illustrator",
        },
        {
          id: "2",
          name: "Adobe inDesign",
          type: "Design",
          desc: "Designing in inDesign",
        },
        {
          id: "3",
          name: "Adobe Photoshop",
          type: "Design",
          desc: "Designing in Photoshop",
        },
        {
          id: "4",
          name: "Figma",
          type: "Desing",
          desc: "Making hi-fi prototypes in figma",
        },
        {
          id: "5",
          name: "Javascript",
          type: "Programming language",
          desc: "Programming with Javascript on the client side.",
        },
        {
          id: "6",
          name: "Node",
          type: "Programming language",
          desc: "Programming with Javascript on the server side.",
        },
        {
          id: "7",
          name: "Express",
          type: "Framework",
          desc: "A framework for programming Javascript on the server side.",
        },
        {
          id: "8",
          name: "HTML",
          type: "Programming",
          desc: "Programming with HTML",
        },
        {
          id: "9",
          name: "CSS",
          type: "Programming Language",
          desc: "Programming with CSS",
        },
        {
          id: "10",
          name: "Adobe Premiere pro",
          type: "Design",
          desc: "Edit videos with premiere pro",
        },
      ];

      // inserts skills
      skills.forEach((oneSkill) => {
        db.run(
          "INSERT INTO skills (sid, sname, sdesc, stype) VALUES (?, ?, ?, ?)",
          [oneSkill.id, oneSkill.name, oneSkill.desc, oneSkill.type],
          (error) => {
            if (error) {
              console.log("ERROR: ", error);
            } else {
              console.log("Line added into the skills table!");
            }
          }
        );
      });
    }
  }
);

//jobs
db.run(
  "CREATE TABLE jobs (jid INTEGER PRIMARY KEY, jname TEXT NOT NULL, jsyear INTEGER NOT NULL,jeyear INTEGER NOT NULL, pdesc TEXT NOT NULL)",
  (error) => {
    if (error) {
      // tests error: display error
      console.log("ERROR: ", error);
    } else {
      // tests error: no error, the table has been created
      console.log("---> Table jobs created!");

      const projects = [
        {
          id: "1",
          name: "Pippi Långstrum Illustration",
          year: 2022,
          desc: "This is an illustration of pippi",
          type: "illustrator",
          url: "/img/Me.jpg",
        },
        {
          id: "2",
          name: "djur",
          year: 2022,
          desc: "This is an illustration of an animal",
          type: "illustrator",
          url: "/img/Me.jpg",
        },
        {
          id: "3",
          name: "Catch the students JavaScript game",
          year: 2023,
          desc: "This is a game made with javascript",
          type: "Programming",
          url: "/img/Me.jpg",
        },
      ];
      // inserts projects
      projects.forEach((oneProject) => {
        db.run(
          "INSERT INTO projects (pid, pname, pyear, pdesc, ptype, pimgURL) VALUES (?, ?, ?, ?, ?, ?)",
          [
            oneProject.id,
            oneProject.name,
            oneProject.year,
            oneProject.desc,
            oneProject.type,
            oneProject.url,
          ],
          (error) => {
            if (error) {
              console.log("ERROR: ", error);
            } else {
              console.log("Line added into the projects table!");
            }
          }
        );
      });
    }
  }
);

app.use(function (req, res) {
  res.status(404).render("404.handlebars");
});

app.listen(port, () => {
  console.log(`Server running and listening on port ${port}...`);
});
