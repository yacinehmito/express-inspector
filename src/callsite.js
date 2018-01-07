const { capitalize } = require("./utils");
const path = require("path");

const getAttributes = [
  "this",
  "typeName",
  "function",
  "functionName",
  "methodName",
  "fileName",
  "lineNumber",
  "columnNumber",
  "evalOrigin"
];

const isAttributes = ["toplevel", "eval", "native", "constructor"];

function datafy(object, attributes, prefix) {
  const output = {};
  for (const attribute of attributes) {
    output[attribute] = object[prefix + capitalize(attribute)].call(object);
  }
  return output;
}
/**
 * Builds an object by executing all getter methods on a CallSite
 * @param {CallSite} callSite
 * @returns {Object} the object with all the results
 */
function getData(callSite) {
  return Object.assign(
    datafy(callSite, getAttributes, "get"),
    datafy(callSite, isAttributes, "is")
  );
}

function toRelativePath(absolutePath) {
  return path.relative(process.cwd(), absolutePath);
}

/**
 * Get the location of the CallSite with the path relative to the current directory
 * @param {CallSite} callSite
 * @returns {string} the location with relative path, line and column numbers
 */
function getRelativeLocation(callSite) {
  const relativeFilePath = toRelativePath(callSite.getFileName());
  return `${relativeFilePath}:${callSite.getLineNumber()}:${callSite.getColumnNumber()}`;
}

module.exports = {
  getData,
  getRelativeLocation
};
