function run(path, inspector, options) {
  inspector.trace();
  const express = require("express");
  express.application.listen = new Proxy(express.application.listen, {
    apply(target, context, args) {
      inspector.inspect(context, options);
      return Reflect.apply(target, context, args);
    }
  });
  require(path);
}

function inspect(path, inspector, options) {
  inspector.trace();
  require("express");
  const app = require(path);
  inspector.inspect(app, options);
}

module.exports = {
  run,
  inspect
};
