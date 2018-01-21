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

jest.mock("express", () => {
  const express = jest.requireActual("express");

  // We don't want to actually start the server
  express.application.listen = () => {};

  return express;
});

const cli = require("../cli");

const undefinedLogger = () => {
  throw new Error("Logger should be set");
};

let mockLogger = undefinedLogger;

function logExample(example, runIt) {
  let output;
  mockLogger = logged => {
    output = logged;
  };
  const modulePath = path.join(__dirname, "../examples", example);
  if (runIt) cli.run(modulePath, jest.requireMock("express-inspector"));
  else require(modulePath);
  mockLogger = undefinedLogger;
  return output;
}

function requireExample(example) {
  return logExample(example, false);
}

function runExample(example) {
  return logExample(example, true);
}

describe("Simple example", () => {
  const output = runExample("simple");
  it("gives the same output as before", () => {
    expect(output).toMatchSnapshot();
  });
});

describe("Full example", () => {
  const output = requireExample("full");
  it("gives the same output as before", () => {
    expect(output).toMatchSnapshot();
  });
});
