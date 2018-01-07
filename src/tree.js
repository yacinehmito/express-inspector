/**
 * Builds a data structure from all the relevant data
 * of the given express app or express Router
 * @param {app|Router} root
 * @returns {Object}
 */
function buildTreeFromRoot(root) {
  if (!root.express) {
    throw new Error("express-inspector: Tracing must be enabled");
  }
  const { Router } = root.express;
  if (root._router) {
    return {
      type: "app",
      instance: root,
      children: root._router.stack.map(buildTreeFromLayer)
    };
  }
  if (Router.isPrototypeOf(root)) {
    return {
      type: "router",
      instance: root,
      children: root.stack.map(buildTreeFromLayer)
    };
  }
  throw new TypeError(
    "express-inspector: object must be an express app or an express Router"
  );
}

function buildTreeFromLayer(layer) {
  if (!layer.express) {
    throw new Error("express-inspector: Tracing must be enabled");
  }
  const { getLayerData, Route, Router } = layer.express;
  if (Route.prototype.isPrototypeOf(layer.route)) {
    return Object.assign(
      {
        type: "route",
        instance: layer.route,
        children: layer.route.stack.map(buildTreeFromLayer)
      },
      getLayerData(layer)
    );
  }
  if (Router.isPrototypeOf(layer.handle)) {
    return Object.assign(
      {
        type: "router",
        instance: layer.handle,
        children: layer.handle.stack.map(buildTreeFromLayer)
      },
      getLayerData(layer)
    );
  }
  if (typeof layer.handle === "function") {
    return Object.assign(
      {
        type: "handler",
        instance: layer.handle,
        name: layer.name
      },
      getLayerData(layer),
      layer.method
        ? {
            method: layer.method
          }
        : null
    );
  }
  throw new Error("express-inspector: Layer of type unknown");
}

module.exports = buildTreeFromRoot;
