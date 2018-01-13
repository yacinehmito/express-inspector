const express = require("express");

const router = require("./router");

const app = express();

app.post("/foos", (req, res) => {
  res.send("POST /foos");
});

app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send("Simple error handler middleware");
  }
  next();
});

app
  .route("/foos/:id")
  .get((req, res) => {
    res.send(`GET /foos/${req.params.id}`);
  })
  .delete((req, res) => {
    res.send(`DELETE /foos/${req.params.id}`);
  });

app.use("/bars", router);

module.exports = app;
