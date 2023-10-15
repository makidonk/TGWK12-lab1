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
const bcrypt = require("bcrypt");
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
//const hash = bcrypt.hashSync(password,10)

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
/* app.get("/projects/:pageNumber", (request, response) => {
  // Calculate the total number of projects
  db.get("SELECT COUNT(*) as totalProjects FROM projects", (error, result) => {
    if (error) {
      // Handle the error
    } else {
      const totalProjects = result.totalProjects;
      const itemsPerPage = 3;
      const pageNumber = parseInt(request.params.pageNumber, 10);
      const totalPages = Math.ceil(totalProjects / itemsPerPage);

      // Calculate the offset and limit
      const offset = (pageNumber - 1) * itemsPerPage;
      const limit = itemsPerPage;

      // Query the database with the offset and limit
      db.all(
        "SELECT * FROM projects LIMIT ? OFFSET ?",
        [limit, offset],
        (error, projects) => {
          if (error) {
            // Handle the error
          } else {
            // Render the page with the projects and pagination information
            response.render("projects.handlebars", {
              projects,
              pageNumber,
              totalPages,
            });
          }
        }
      );
    }
  });
}); */

app.get("/projects/:id", (request, response) => {
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
        response.render("projects.handlebars", model);
      } else {
        const model = {
          dbError: false,
          theError: "",
          project: theProjects,
          isLoggedIn: request.session.isLoggedIn,
          name: request.session.name,
          isAdmin: request.session.isAdmin,
        };
        response.render("projectInfo.handlebars", model);
      }
    }
  );
});

app.get("/skills", (request, response) => {
  // Retrieve data from the "skills" table
  db.all("SELECT * FROM skills", function (skillsError, skillsResult) {
    if (skillsError) {
      const model = {
        dbError: true,
        theError: skillsError,
        skills: [],
        jobs: [],
        isLoggedIn: request.session.isLoggedIn,
        name: request.session.name,
        isAdmin: request.session.isAdmin,
      };
      // Render the page with the model
      response.render("skills.handlebars", model);
    } else {
      // Retrieve data from the "jobs" table
      db.all("SELECT * FROM jobs", function (jobsError, jobsResult) {
        if (jobsError) {
          const model = {
            dbError: true,
            theError: jobsError,
            skills: [],
            jobs: [],
            isLoggedIn: request.session.isLoggedIn,
            name: request.session.name,
            isAdmin: request.session.isAdmin,
          };
          // Renders the page with the model
          response.render("skills.handlebars", model);
        } else {
          const model = {
            dbError: false,
            theError: "",
            skills: skillsResult,
            jobs: jobsResult,
            isLoggedIn: request.session.isLoggedIn,
            name: request.session.name,
            isAdmin: request.session.isAdmin,
          };
          // Renders the page with the model
          response.render("skills.handlebars", model);
        }
      });
    }
  });
});

//login
app.get("/login", (request, response) => {
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

  const { un, pw } = request.body;

  db.get("SELECT * FROM users WHERE name = ?", [un], function (err, user) {
    if (err) {
      console.log("error while logging in");
      response.status(500).send({ error: "server error" });
    } else if (!user) {
      response.status(401).send({ error: "user not found" });
    } else {
      const passwordsMatch = bcrypt.compareSync(pw, user.password);
      if (passwordsMatch) {
        if (un === "Admin") {
          request.session.isAdmin = true;
        } else {
          request.session.isAdmin = false;
        }
        request.session.user = user;
        request.session.isLoggedIn = true;
        request.session.name = un;
        response.redirect("/");
      } else {
        console.log("not right username or password");
        request.session.isLoggedIn = false;
        request.session.isAdmin = false;
      }
    }
  });
});

//logout
app.get("/logout", function (request, response) {
  request.session.destroy((error) => {
    console.log("error while destroying session: ", error);
  });

  console.log("logged out");
  response.redirect("/");
});

//Register
app.get("/login/register", (request, response) => {
  const model = {
    isLoggedIn: request.session.isLoggedIn,
    name: request.session.name,
    isAdmin: request.session.isAdmin,
  };
  response.render("register.handlebars", model);
});
app.post("/login/register", (request, response) => {
  const username = request.body.un;
  const password = request.body.pw;
  //check so its not the same username!

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.log("Password hashing error:", err);
      response.redirect("/login/register");
    } else {
      // Insert the new user with the hashed password into the database
      db.run(
        "INSERT INTO users (name, password) VALUES (?, ?)",
        [username, hashedPassword],
        (error) => {
          if (error) {
            console.log("Database insertion error:", error);
          } else {
            console.log("line added to users table");
          }
          response.redirect("/login");
        }
      );
    }
  });
});

//delete profile
app.get("/login/delete", (request, response) => {
  const model = {
    isLoggedIn: request.session.isLoggedIn,
    name: request.session.name,
    isAdmin: request.session.isAdmin,
  };
  response.render("delete.handlebars", model);
});

//projects database
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
          name: "Pippi Långstrump Illustration",
          year: 2022,
          desc: "This is an illustration I made in a course called Foundations of Graphic Design. The assignment was to create a very simplified version of anything, but still keeping it recognizable. I chose to do Pippi Longstocking, and started to gather images of her and her animals. I then used Procreate to try different placements until i found the current one. After that i traced the silhouettes and transferred the outline to Illustrator. There i traced it and chose colors.",
          type: "illustrator",
          url: "/img/stylization.png",
        },
        {
          id: "2",
          name: "djur",
          year: 2022,
          desc: "This is an illustration I made of my friends dog Bosse! She asked me to create a simplified illustration of him and sent me a couple of pictures. I then chose one of them and started to block in colors.",
          type: "illustrator",
          url: "/img/animalPainting.jpg",
        },
        {
          id: "3",
          name: "Catch the students JavaScript game",
          year: 2023,
          desc: "This is a game I and my friend made with JavaScript for an assignment in my course Foundations of Programming. We started by brainstorming ideas and came up with the idea of dragging students into a classroom. We illustrated the whole interface using Illustrator, and coded in Visual studio code using JavaScript p5canvas, html and css",
          type: "Programming",
          url: "/img/game.png",
        },
        {
          id: "4",
          name: "Sweats & Smiles Magazine",
          year: 2023,
          desc: "This is a game made with javascript",
          type: "Programming",
          url: "/img/magazine.png",
        },
        {
          id: "5",
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
app.get("/projects/delete/:id", (request, response) => {
  const id = request.params.id;
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    db.run(
      "DELETE FROM projects WHERE pid=?",
      [id],
      function (error, theProjects) {
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
          response.redirect("/projects");
        }
      }
    );
  } else {
    response.redirect("/login");
  }
});

//modify a project
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

// skills database
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

//add skill
app.get("/skills/new", function (request, response) {
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    const model = {
      isLoggedIn: request.session.isLoggedIn,
      name: request.session.name,
      isAdmin: request.session.isAdmin,
    };
    response.render("newSkill.handlebars", model);
  } else {
    response.redirect("/login");
  }
});
app.post("/skills/new", (request, response) => {
  const news = [
    request.body.skillname,
    request.body.skilldesc,
    request.body.skilltype,
  ];
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    db.run(
      "INSERT INTO skills (sname, sdesc, stype) VALUES (?,?,?)",
      news,
      (error) => {
        if (error) {
          console.log("ERROR:", error);
        } else {
          console.log("line added to skills table");
        }
        response.redirect("/skills");
      }
    );
  } else {
    response.redirect("/login");
  }
});

//modify skill
app.get("/skills/modify/:id", (request, response) => {
  const id = request.params.id;
  db.get("SELECT * FROM skills WHERE sid=?", [id], function (error, theSkills) {
    if (error) {
      console.log("ERROR:", error);
      const model = {
        dbError: true,
        theError: error,
        skill: {},
        isLoggedIn: request.session.isLoggedIn,
        name: request.session.name,
        isAdmin: request.session.isAdmin,
      };
      response.render("modifySkills.handlebars", model);
    } else {
      const model = {
        dbError: false,
        theError: "",
        skill: theSkills,
        isLoggedIn: request.session.isLoggedIn,
        name: request.session.name,
        isAdmin: request.session.isAdmin,
        helpers: {
          theTypeD(value) {
            return value == "Design";
          },
          theTypeP(value) {
            return value == "Programming language";
          },
          theTypeF(value) {
            return value == "Framework";
          },
        },
      };
      response.render("modifySkills.handlebars", model);
    }
  });
});
app.post("/skills/modify/:id", (request, response) => {
  const id = request.params.id;
  const news = [request.body.skillname, request.body.skilldesc, id];
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    db.run("UPDATE skills SET sname=?, sdesc=? WHERE sid=?", news, (error) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        console.log("skill updated!");
      }
      response.redirect("/skills");
    });
  } else {
    response.redirect("/login");
  }
});

//delete skill
app.get("/skills/delete/:id", (request, response) => {
  const id = request.params.id;
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    db.run("DELETE FROM skills WHERE sid=?", [id], function (error, theSkills) {
      if (error) {
        const model = {
          dbError: true,
          theError: error,
          isLoggedin: request.session.isLoggedIn,
          name: request.session.name,
          isAdmin: request.session.isAdmin,
        };
        response.render("skills.handlebars", model);
      } else {
        const model = {
          dbError: false,
          theError: "",
          isLoggedin: request.session.isLoggedIn,
          name: request.session.name,
          isAdmin: request.session.isAdmin,
        };
        response.redirect("/skills");
      }
    });
  } else {
    response.redirect("/login");
  }
});

//jobs database
db.run(
  "CREATE TABLE jobs (jid INTEGER PRIMARY KEY, jname TEXT NOT NULL, jsyear INTEGER NOT NULL,jeyear INTEGER NOT NULL, jdesc TEXT NOT NULL)",
  (error) => {
    if (error) {
      // tests error: display error
      console.log("ERROR: ", error);
    } else {
      // tests error: no error, the table has been created
      console.log("---> Table jobs created!");

      const jobs = [
        {
          id: "1",
          name: "Rol Ergo",
          syear: 2021,
          eyear: 2022,
          desc: "Factory work",
        },
        {
          id: "2",
          name: "FJ Sintermetall",
          syear: 2020,
          eyear: 2021,
          desc: "Factory work",
        },
        {
          id: "3",
          name: "ICA",
          syear: 2017,
          eyear: 2018,
          desc: "Cashier",
        },
        {
          id: "4",
          name: "Assistant",
          syear: 2016,
          eyear: 2017,
          desc: "Assistant to Spider Man, flying, fighting",
        },
        {
          id: "5",
          name: "Chiller",
          syear: 2001,
          eyear: 2016,
          desc: "Watched movies and played piano",
        },
      ];
      // inserts projects
      jobs.forEach((oneJob) => {
        db.run(
          "INSERT INTO jobs (jid, jname, jsyear, jeyear, jdesc) VALUES (?, ?, ?, ?, ?)",
          [oneJob.id, oneJob.name, oneJob.syear, oneJob.eyear, oneJob.desc],
          (error) => {
            if (error) {
              console.log("ERROR: ", error);
            } else {
              console.log("Line added into the projects jobs!");
            }
          }
        );
      });
    }
  }
);
//add job
app.get("/jobs/new", function (request, response) {
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    const model = {
      isLoggedIn: request.session.isLoggedIn,
      name: request.session.name,
      isAdmin: request.session.isAdmin,
    };
    response.render("newJob.handlebars", model);
  } else {
    response.redirect("/login");
  }
});
app.post("/jobs/new", (request, response) => {
  const newj = [
    request.body.jobname,
    request.body.jobdesc,
    request.body.jsyear,
    request.body.jeyear,
  ];
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    db.run(
      "INSERT INTO jobs (jname, jdesc, jsyear, jeyear ) VALUES (?,?,?, ?)",
      newj,
      (error) => {
        if (error) {
          console.log("ERROR:", error);
        } else {
          console.log("line added to jobs table");
        }
        response.redirect("/skills");
      }
    );
  } else {
    response.redirect("/login");
  }
});
//delete job
app.get("/jobs/delete/:id", (request, response) => {
  const id = request.params.id;
  if (request.session.isLoggedIn == true && request.session.isAdmin == true) {
    db.run("DELETE FROM jobs WHERE jid=?", [id], function (error, theJobs) {
      if (error) {
        const model = {
          dbError: true,
          theError: error,
          isLoggedin: request.session.isLoggedIn,
          name: request.session.name,
          isAdmin: request.session.isAdmin,
        };
        response.render("skills.handlebars", model);
      } else {
        const model = {
          dbError: false,
          theError: "",
          isLoggedin: request.session.isLoggedIn,
          name: request.session.name,
          isAdmin: request.session.isAdmin,
        };
        response.redirect("/skills");
      }
    });
  } else {
    response.redirect("/login");
  }
});

//users database
db.run(
  "CREATE TABLE users (uid INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, password TEXT NOT NULL)",
  (error) => {
    if (error) {
      // tests error: display error
      console.log("ERROR: ", error);
    } else {
      // tests error: no error, the table has been created
      console.log("---> Table users created!");

      const users = [
        {
          id: "1",
          name: "Admin",
          password: "1",
        },
        {
          id: "2",
          name: "user1",
          password: "1",
        },
        {
          id: "3",
          name: "user2",
          password: "2",
        },
        {
          id: "4",
          name: "user3",
          password: "3",
        },
        {
          id: "5",
          name: "user4",
          password: "4",
        },
      ];
      // inserts projects
      users.forEach(async (oneUser) => {
        const hashUserPassword = await bcrypt.hash(oneUser.password, 10);
        db.run(
          "INSERT INTO users (uid, name, password) VALUES (?, ?, ?)",
          [oneUser.id, oneUser.name, hashUserPassword],
          (error) => {
            if (error) {
              console.log("ERROR: ", error);
            } else {
              console.log("Line added into the projects users!");
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
