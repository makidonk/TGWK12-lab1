const port = 6789;
const express = require("express");
const app = express();
const fs = require("fs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  const html = fs.readFileSync("mycv-06.html");
  res.setHeader("Content-Type", "text/html").status(200).send(html);
});

app.listen(port, () => {
  console.log(`Express server is listening to port ${port}`);
});
