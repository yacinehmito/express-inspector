const { getData } = require("../callsite");

function hideIfObject(value) {
  const type = typeof value;
  if (type === "function" || (type === "object" && type !== null)) {
    return `[${Object.getPrototypeOf(value).constructor.name}]`;
  }
  return value;
}

function formatCallSite(callSite) {
  const data = getData(callSite);
  data.this = hideIfObject(data.this);
  data.function = hideIfObject(data.function);
  return data;
}

function initialReplacer(k, v) {
  if (k === "instance") return hideIfObject(v);
  if (k === "trace") return v.map(formatCallSite);
  return v;
}

function json(report, replacer) {
  const finalReplacer = replacer
    ? (k, v) => replacer(k, initialReplacer(k, v))
    : initialReplacer;
  return JSON.stringify(report, finalReplacer, 2);
}

module.exports = json;
