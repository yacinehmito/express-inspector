const fs = require("fs");
const path = require("path");

jest.mock("express-inspector", () => {
  const inspector = jest.requireActual("..");

  // We want the trace function to use jest.setMock as the replacer
  // because jest tests don't have a module cache to hack
  const trace = new Proxy(inspector.trace, {
    apply(target, context, args) {
      args = args.slice(0);
      const options = Object.assign({}, args[0], {
        replacer: jest.setMock
      });
      args[0] = options;
      return Reflect.apply(target, context, args);
    }
  });

  // We don't want inspect to write to stdout so we overwrite the logger
  // and set it before each test
  const inspect = new Proxy(inspector.inspect, {
    apply(target, context, args) {
      args = args.slice(0);
      const options = Object.assign({}, args[1], {
        logger: mockLogger
      });
      args[1] = options;
      return Reflect.apply(target, context, args);
    }
  });

  return Object.assign({}, inspector, { trace, inspect });
});

const undefinedLogger = () => {
  throw new Error("Logger should be set");
};

let mockLogger = undefinedLogger;

function runExample(example) {
  let output;
  mockLogger = logged => {
    output = logged;
  };
  require(path.join(__dirname, "../examples", example));
  mockLogger = undefinedLogger;
  return output;
}

jest.mock("express", () => {
  const express = jest.requireActual("express");

  // We don't want to actually start the server
  express.application.listen = () => {};

  return express;
});

fs.readdirSync(path.join(__dirname, "../examples")).map(example => {
  describe(`Example ${example}`, () => {
    const output = runExample(example);
    it("gives the same output as before", () => {
      expect(output).toMatchSnapshot();
    });
  });
});
