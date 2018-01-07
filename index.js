const trace = require("./src/trace");
const { getLazySandbox } = require("./src/sandbox");

module.exports = {
  inspect: require("./src/inspect"),
  format: require("./src/format"),
  tree: require("./src/tree"),
  get express() {
    return getLazySandbox();
  },
  trace
};
