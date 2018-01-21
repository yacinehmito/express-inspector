const { isApplication } = require("./src/types");

const ORIGINAL_CREATE_SERVER = Symbol("Original createServer");
const ORIGINAL_SERVER_LISTEN = Symbol("Original Server.prototype.listen");

function proxyHttp(http, inspector, options) {
  const createServer = http[ORIGINAL_CREATE_SERVER] || http.createServer;
  http[ORIGINAL_CREATE_SERVER] = createServer;
  const listen = http[ORIGINAL_SERVER_LISTEN] || http.Server.prototype.listen;
  http[ORIGINAL_SERVER_LISTEN] = listen;

  const expressServers = new WeakMap();

  http.createServer = new Proxy(createServer, {
    apply(target, context, args) {
      const [requestListener] = args;
      const server = Reflect.apply(target, context, args);
      if (requestListener && isApplication(requestListener)) {
        expressServers.set(server, requestListener);
      }
      return server;
    }
  });

  http.Server.prototype.listen = new Proxy(listen, {
    apply(target, context, args) {
      const server = context;
      const app = expressServers.get(server);
      if (app) {
        inspector.inspect(app, options);
      }
      return Reflect.apply(target, context, args);
    }
  });
}

function run(path, inspector, options) {
  inspector.trace();
  require("express");
  proxyHttp(require("http"), inspector, options);
  proxyHttp(require("https"), inspector, options);
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
