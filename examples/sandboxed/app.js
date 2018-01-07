const { express } = require("express-inspector");
const router = require("./router");

const app = express();

app.use("/", router);

module.exports = app;
