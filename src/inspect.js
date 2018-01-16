const buildTree = require("./tree");
const format = require("./format");

const defaultOptions = {
  logger: process.stdout.write.bind(process.stdout),
  format: "compact"
};

function inspect(root, options) {
  const opts = Object.assign({}, defaultOptions, options);

  const formatter = processFormatOption(opts.format);
  const logger = processLoggerOption(opts.logger);

  const reportTree = buildTree(root);
  const formattedReport = formatter(reportTree);
  logger(formattedReport);
}

function processFormatOption(formatOption) {
  if (typeof formatOption === "function") {
    return formatOption;
  }
  if (typeof formatOption === "string") {
    if (!format[formatOption]) {
      throw new Error(`express-inspector: format ${formatOption} unknown`);
    }
    return format[formatOption];
  }
  throw new TypeError(
    "express-inspector: format must either be a function or a string"
  );
}

function processLoggerOption(loggerOption) {
  if (typeof loggerOption !== "function") {
    throw new TypeError("express-inspector: logger must be a function");
  }
  return loggerOption;
}

module.exports = inspect;
