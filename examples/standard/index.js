const { inspect } = require("express-inspector");
const app = require("./app");

if (process.env.NODE_ENV !== "production") {
  inspect(app);
}

app.listen();
