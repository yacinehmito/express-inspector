let inspector;

if (process.env.NODE_ENV !== "production") {
  inspector = require("express-inspector");
  inspector.trace();
}

const app = require("./app");

if (process.env.NODE_ENV !== "production") {
  inspector.inspect(app);
}

app.listen();
