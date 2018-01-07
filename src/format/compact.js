const { capitalize } = require("../utils");
const { getRelativeLocation } = require("../callsite");

function formatLine(object) {
  const { type, trace, name, path, method } = object;
  const parts = [];
  if (["router", "route"].includes(type)) parts.push(capitalize(type));
  if (method) parts.push(method.toUpperCase());
  if (path) parts.push(path);
  if (name) parts.push(name);
  return {
    left: parts.join(" "),
    right: trace ? getRelativeLocation(trace[0]) : ""
  };
}

function getLines(object) {
  const { type, children, method } = object;
  if (type === "app") {
    return children.reduce((lines, child) => lines.concat(getLines(child)), []);
  }
  if (children && children.length > 0) {
    return children.reduce(
      (lines, child) =>
        lines.concat(
          getLines(child).map(({ left, right }) => ({
            left: "  " + left,
            right
          }))
        ),
      [formatLine(object)]
    );
  }
  if (method) return [formatLine(object)];
  return [];
}

function compact(report) {
  const lines = getLines(report);
  const pad = lines.reduce(
    (maxLength, { left }) => Math.max(maxLength, left.length),
    26
  );
  return (
    getLines(report)
      .map(({ left, right }) => `${left.padEnd(pad)} \x1b[2m${right}\x1b[0m`)
      .join("\n") + "\n"
  );
}

module.exports = compact;
