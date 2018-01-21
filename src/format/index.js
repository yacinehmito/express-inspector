if (!String.prototype.padEnd) {
  const padEndPolyfill = require("pad-end");
  String.prototype.padEnd = function padEnd(...args) {
    return padEndPolyfill(this, ...args);
  };
}

module.exports = {
  compact: require("./compact"),
  json: require("./json"),
  flat: require("./flat")
};
