const path = require("path");
const { trace, format, tree } = require("..");
const { takeUntil } = require("../src/utils");

trace({ replacer: jest.setMock });

const app = require("./_regressionsApp");

function makePathRelativeToProject(absolutePath) {
  return path.relative(path.join(__dirname, ".."), absolutePath);
}

// We need to remove deep calls in the stacktrace and absolute paths;
// otherwise snapshots would be sensitive to context
function normalizeTrace(trace) {
  const inProject = takeUntil(trace, traceObject =>
    /node_modules\/jest/.test(traceObject.fileName)
  );
  return inProject.map(traceObject =>
    Object.assign({}, traceObject, {
      fileName: makePathRelativeToProject(traceObject.fileName),
      evalOrigin: makePathRelativeToProject(traceObject.evalOrigin)
    })
  );
}

describe("json format", () => {
  it("matches previous version", () => {
    expect(
      format.json(tree(app), (k, v) => (k === "trace" ? normalizeTrace(v) : v))
    ).toMatchSnapshot();
  });
});

describe("compact format", () => {
  it("matches previous version", () => {
    expect(format.compact(tree(app))).toMatchSnapshot();
  });
});
