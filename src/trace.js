const stackTrace = require("stack-trace");
const methods = require("methods");

// Only works with node >= 6.4.0

// TODO: Find a better way to remove call sites in express code
function removeInternalCallSites(callSites, offset = 0) {
  let i = offset;
  for (; i < callSites.length; i++) {
    const origin = callSites[i].getEvalOrigin();
    if (origin && !/node_modules\/express\//.test(origin)) break;
  }
  return callSites.slice(i);
}

// TODO: Get data from Layer constructor
// It will allow us to:
// - be sure to get the actual path
// - override only one function (as opposed to many in Route & Router)
// - get rid of the dependency "methods"
// It's hard to do because we can't mutate it

/**
 * Will setup the tracing on the express function
 * @param {*} express The express object as imported
 */
function trace(express) {
  if (express.proxied) {
    return express;
  }

  express.proxied = true;

  const { Router, Route, application } = express;

  Router.express = express;
  Route.prototype.express = express;
  application.init = new Proxy(application.init, {
    apply(target, context, args) {
      const output = Reflect.apply(target, context, args);
      context.express = express;
      return output;
    }
  });

  // data that depends on a layer
  const layersData = new WeakMap();
  express.getLayerData = function(layer) {
    return layersData.get(layer);
  };

  function applyProxy(proto, methodName) {
    proto[methodName] = proxyMethod(express, proto[methodName], layersData);
  }

  // These are all the methods that call Layer
  applyProxy(Router, "route");
  applyProxy(Router, "use");
  applyProxy(Route.prototype, "all");
  for (const method of methods) {
    applyProxy(Route.prototype, method);
  }

  return express;
}

function proxyMethod(express, method, layersData) {
  // - captures the path
  // - captures the stack trace
  // - saves express in layers
  return new Proxy(method, {
    apply(target, context, args) {
      const trace = stackTrace.get();
      const route = Reflect.apply(target, context, args);
      const layer = context.stack[context.stack.length - 1];
      layer.express = express;
      layersData.set(layer, {
        trace: removeInternalCallSites(trace, 1),
        // Assumes that, if the first argument is a string, then it must be the path
        path: typeof args[0] === "string" ? args[0] : undefined
      });
      return route;
    }
  });
}

module.exports = trace;
