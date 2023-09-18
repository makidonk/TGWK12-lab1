const express = require("express");
const app = express();
const port = 5678;

app.get("/", (req, res) => {
  res.status(200).type("text/plain").send("Hello World!");
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port} ...`);
});
