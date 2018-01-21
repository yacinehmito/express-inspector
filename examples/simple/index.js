const express = require("express");

const app = express();

app.get("/:name", (req, res) => {
  res.send(`Hello ${req.params.name}`);
});

app.listen();
