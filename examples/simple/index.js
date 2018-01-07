const express = require("express");
const inspector = require("express-inspector");

inspector.trace(express);

const app = express();

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/:name", (req, res) => {
  res.send(`Hello ${req.params.name}`);
});

inspector.inspect(app);

app.listen();
