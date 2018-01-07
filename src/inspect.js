const buildTree = require("./tree");
const format = require("./format");

const defaultOptions = {
  logger: process.stdout.write.bind(process.stdout),
  format: "compact"
};

function inspect(root, options) {
  const opts = Object.assign({}, defaultOptions, options);

  let formatter;
  if (typeof opts.format === "function") {
    formatter = opts.format;
  } else if (typeof opts.format === "string") {
    if (!format[opts.format]) {
      throw new Error(`Format ${opts.format} unknown`);
    }
    formatter = format[opts.format];
  } else {
    throw new TypeError("Format must either be a function or a string");
  }

  if (typeof opts.logger !== "function") {
    throw new TypeError("Logger must be a function");
  }

  opts.logger(formatter(buildTree(root)));
}

module.exports = inspect;
