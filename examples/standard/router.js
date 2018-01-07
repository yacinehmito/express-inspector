const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("GET /bars");
});

router.get("/:id", (req, res) => {
  res.send(`GET /bars/${req.params.id}`);
});

module.exports = router;
