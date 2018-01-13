const { getLayerModulePath, proxyLayer, PROXIED } = require("./layer");

function nodeReplacer(modulePath, substituteModule) {
  require(modulePath);
  require.cache[require.resolve(modulePath)].exports = substituteModule;
}

const defaultOptions = {
  moduleName: "express",
  replacer: nodeReplacer
};

function traceExpress(options) {
  const { moduleName, replacer } = Object.assign({}, defaultOptions, options);
  const modulePath = require.resolve(moduleName);
  const layerPath = getLayerModulePath(modulePath);
  if (!layerPath) {
    throw new Error(
      `express-inspector: module ${moduleName} doesn't seem to be compatible with express-inspector`
    );
  }
  const Layer = require(layerPath);
  if (!Layer[PROXIED]) {
    replacer(layerPath, proxyLayer(Layer));
  }
}

module.exports = traceExpress;
