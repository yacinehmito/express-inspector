const { express } = require("express-inspector");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello world!");
});

module.exports = router;
