const StackTrace = require("stack-trace");
const { dropUntil } = require("./utils");
const fs = require("fs");
const path = require("path");

const PROXIED = Symbol("PROXIED_LAYER");

function isCallSiteRelevant(callSite) {
  // The call site is relevant if we can pin its location
  // and if it is not inside express
  if (callSite.isNative()) {
    return false;
  }
  const fileName = callSite.getFileName();
  return fileName && !/node_modules\/express\//.test(fileName);
}

function getStackTrace() {
  // Removing first three entries because:
  // - first one is the current function
  // - second one is constructTrap
  // - third one is the traps themselves
  return dropUntil(StackTrace.get().slice(3), isCallSiteRelevant);
}

function constructTrap(target, args, newTarget) {
  const layer = Reflect.construct(target, args, newTarget);
  const [path, options, fn] = args; // eslint-disable-line no-unused-vars
  const trace = getStackTrace();
  const layerData = { trace, path };
  layersData.set(layer, layerData);
  layer[PROXIED] = true;
  return layer;
}

function proxyLayer(Layer) {
  // We need to trap both construct and apply because Layer is sometimes called without new
  // Even though calling the original Layer as a function will construct a Layer,
  // the reference to the constructor is not the proxied one so we need to bypass it
  const proxy = new Proxy(Layer, {
    // We avoid doing construct: constructTrap
    // so we can always remove the first three call sites in the stack
    construct(target, args, newTarget) {
      return constructTrap(target, args, newTarget);
    },
    apply(target, context, args) {
      return constructTrap(target, args, proxy);
    }
  });
  return proxy;
}

function getLayerModulePath(expressPath) {
  const layerPath = path.join(expressPath, "../lib/router/layer.js");
  if (!fs.existsSync(layerPath)) return null;
  return layerPath;
}

const layersData = new WeakMap();

function getLayerData(layer) {
  return layersData.get(layer);
}

module.exports = {
  proxyLayer,
  getLayerData,
  getLayerModulePath,
  PROXIED
};
