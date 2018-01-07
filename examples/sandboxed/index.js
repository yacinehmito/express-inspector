const { inspect } = require("express-inspector");
const app = require("./app");

inspect(app);

app.listen();
