const path = require("path");
const { getLayerData, PROXIED } = require("./layer");
const { isApplication, isRouter, isRoute } = require("./types");

/**
 * Builds a data structure from all the relevant data
 * of the given express app or express Router
 * @param {app|Router} root
 * @returns {Object}
 */
function buildTreeFromRoot(root) {
  const node = {
    instance: root,
    path: "/",
    fullpath: "/"
  };

  function makeNode(data) {
    return Object.assign({}, data, node);
  }

  function buildChildNode(layer) {
    return buildNodeFromLayer(layer, "/");
  }

  if (isApplication(root)) {
    return makeNode({
      type: "app",
      children:
        root._router && isRouter(root._router)
          ? root._router.stack.map(buildChildNode)
          : []
    });
  }
  if (isRouter(root)) {
    return makeNode({
      type: "router",
      instance: root,
      children: root.stack.map(buildChildNode)
    });
  }
  throw new TypeError(
    "express-inspector: object must be an express app or an express Router"
  );
}

function buildNodeFromLayer(layer, currentFullpath) {
  if (!layer[PROXIED]) {
    throw new Error(
      "express-inspector: layer has been instanciated without tracing"
    );
  }

  const layerData = getLayerData(layer);
  const fullpath =
    !layerData.path || layerData.path === "/"
      ? currentFullpath
      : path.join(currentFullpath, layerData.path);

  const node = { fullpath };
  // We extract the method here and not in the Layer proxy
  // because it is added to the layer after instantiation
  if (layer.method) node.method = layer.method;

  function makeNode(data) {
    return Object.assign({}, data, node, layerData);
  }

  function buildChildNode(layer) {
    return buildNodeFromLayer(layer, fullpath);
  }

  if (isRoute(layer.route)) {
    return makeNode({
      type: "route",
      instance: layer.route,
      children: layer.route.stack.map(buildChildNode)
    });
  }
  if (isRouter(layer.handle)) {
    return makeNode({
      type: "router",
      instance: layer.handle,
      children: layer.handle.stack.map(buildChildNode)
    });
  }
  if (typeof layer.handle === "function") {
    return makeNode({
      type: "handler",
      instance: layer.handle,
      name: layer.name
    });
  }
  throw new Error("express-inspector: layer of type unknown");
}

module.exports = buildTreeFromRoot;
