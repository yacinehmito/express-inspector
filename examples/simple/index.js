const inspector = require("express-inspector");
inspector.trace();
const express = require("express");

const app = express();

app.get("/:name", (req, res) => {
  res.send(`Hello ${req.params.name}`);
});

inspector.inspect(app);

app.listen();
