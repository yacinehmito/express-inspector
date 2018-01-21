if (process.env.NODE_ENV !== "production") {
  const inspector = require("express-inspector");
  inspector.trace();

  const app = require("./app");

  if (process.env.NODE_ENV !== "production") {
    inspector.inspect(app, {
      logger(report) {
        process.stderr.write(report);
      },
      format: "flat"
    });
  }
}

const app = require("./app");

app.listen();
