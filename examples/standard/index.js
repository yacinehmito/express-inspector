const inspector = require("express-inspector");

if (process.env.NODE_ENV !== "production") {
  inspector.trace();
}

const app = require("./app");

if (process.env.NODE_ENV !== "production") {
  inspector.inspect(app);
}

app.listen();
