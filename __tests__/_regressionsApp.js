const express = require("express");

const app = express();

// Testing simple case
app.post("/foos", (req, res) => {
  res.send("POST /foos");
});

// Testing global middleware
app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send("Simple error handler middleware");
  }
  next();
});

// Testing method chain
app
  .route("/foos/:id")
  .get((req, res) => {
    res.send(`GET /foos/${req.params.id}`);
  })
  .delete((req, res) => {
    res.send(`DELETE /foos/${req.params.id}`);
  });

// Testing Router
const router = express.Router();

router.get("/", (req, res) => {
  res.send("GET /bars");
});

router.get("/:id", (req, res) => {
  res.send(`GET /bars/${req.params.id}`);
});

app.use("/bars", router);

// Testing local middleware
function localMiddleware(req, res, next) {
  next();
}
app.get("/baz", localMiddleware, (req, res) => {
  res.send("GET /baz");
});

module.exports = app;
