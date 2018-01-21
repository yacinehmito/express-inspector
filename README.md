# express-inspector

[![npm](https://img.shields.io/npm/v/express-inspector.svg)](https://www.npmjs.com/package/express-inspector) [![Build Status](https://travis-ci.org/yacinehmito/express-inspector.svg?branch=master)](https://travis-ci.org/yacinehmito/express-inspector) [![Codacy Grade Badge](https://api.codacy.com/project/badge/Grade/405ea9dabfd744468e7646bd60b70a5c)](https://www.codacy.com/app/yacinehmito/express-inspector?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=yacinehmito/express-inspector&amp;utm_campaign=Badge_Grade) [![Codacy Coverage Badge](https://api.codacy.com/project/badge/Coverage/405ea9dabfd744468e7646bd60b70a5c)](https://www.codacy.com/app/yacinehmito/express-inspector?utm_source=github.com&utm_medium=referral&utm_content=yacinehmito/express-inspector&utm_campaign=Badge_Coverage) [![Greenkeeper badge](https://badges.greenkeeper.io/yacinehmito/express-inspector.svg)](https://greenkeeper.io/) [![License Badge](https://img.shields.io/npm/l/express-inspector.svg)](LICENSE)

The tool express-inspector helps you understand your express app by reporting all its routes and the files where they were defined.

**This project is early stage. The API may change often.**

## Example

Say you have the following `index.js` file:

```javascript
const express = require("express");

const app = express();

app.get("/:name", (req, res) => {
  res.send(`Hello ${req.params.name}`);
});

app.listen();
```

Run it with `express-inspector run index.js` and it will output:

```
Route /:name             index.js:5:5
GET / <anonymous>        index.js:5:5
```

Obviously it gets more interesting if you have a more complicated setup.

## Getting Started

### Prerequisites

The package has only been tested with express 4.15.\*.

It is declared as a peer dependency of express-inspector so make sure that you have express installed.

### Installing

```
npm install --save-dev express-inspector
```

Or, with yarn:

```
yarn add --dev express-inspector
```

We recommand **not** to install express-inspector globally as it should use your project's version of express.

### Usage

The easiest way to use express-inspector is with the command line interface.

Let's assume that your express server is being run by the file `server.js` in your project's root directory.
In `package.json`, add the following script:

```json
{
  "scripts": {
    "start": "express-inspector run server.js"
  }
}
```

Run `yarn start` to start your server. The method `listen` of your express app will output the inspection report when it is called. 

## Advanced features

### Inspect an app without starting the server

If you have a file that exports the express application (say `app.js`), you can inspecting from the CLI without starting any server. To do so, add the following script to your `package.json` file:

```json
{
  "scripts": {
    "inspect": "express-inspector inspect app.js"
  }
}
```

Now, do `yarn inspect` to output the report.

### Use express-inspector with nodemon

The following script is often used with express projects:

```json
{
  "scripts": {
    "dev": "nodemon server.js"
  }
}
```

To inspect the express app every time the server restart, replace it with:

```json
{
  "scripts": {
    "dev": "nodemon --exec \"express-inspector run server.js\""
  }
}
```

Another way would be to inspect the express app programmatically.

### Programmatic inspection with the Node API

You can also output the report directly from your code using the Node API.

To do so, you first need to enable tracing for the express objects by calling the function `trace` before requiring express. Then you can call `inspect` on an application or on a router. It will output the report in your console.

Example:

```javascript
const inspector = require("express-inspector");
inspector.trace();
const express = require("express");

// Other calls of `require` here

const app = express();

// More of your code...

inspector.inspect(app) // Before call to `listen`
```

Of course you can disable tracing in production by first checking the value of `process.env.NODE_ENV`, as in the example file `examples/full/index.js`.

### Changing the format of the report

The library comes bundled with three formats: `compact` (the default), `flat` and `json`. You can pass any of those to the command line interface with the `format` option. Example:

```json
{
  "scripts": {
    "start": "express-inspector --format=flat server.js"
  }
}
```

If you use the Node API, you can set options by passing an object to the second argument of the function `inspect`.
The `format` key can take as value either any of the three formats or a custom function (see next section).

Example:

```javascript
inspector.inspect(appOrRouter, {
  format: "flat"
}
```

The compact format provides you with all the useful information you may need: how the app is structure and where in your code each router, route and handler has been defined. It ignores the middlewares.

The flat format simply lists all the endpoints and where each is defined in your code.

The json format outputs the whole report tree in JSON so you can then feed it to another program.

### Using a custom format

The option `format` can also be set to a function. Such a function will be provided a report tree as its first argument, which is an object whose internal structure matches the app's or the router's. It should then return a string.

A report tree is equal to its root node. A node has the following structure (as per Flowtype or Typescript type definitions):

```typescript
type Node = {
  type: "app" | "router" | "route" | "handler",
  path: string,
  fullpath: string,
  instance: Object, // The express object that the node describes
  children?: Array<Node>
  trace?: Array<CallSite> // The call sites as captured by `stack-trace`
}
```

The JSON that you get by using the format `json` has a similar structure. It has only two meaningful differences:

- The value of `instance` is replaced by a string that describes the type of the object.
- Call sites are serialized by calling every one of their methods and saving the output into a property named appropriately.

### Changing how the report is logged

By default, `inspect` will write the report to standard output. If you would rather plug your own logger, you can pass it as an option.

Example when writing the report to standard error:

```javascript
inspector.inspect(app, {
  logger(report) {
    process.stderr.write(report);
  }
})
```

### Using the lower-level API

You can build your own `inspect` function with `tree` and `format`.

The function `tree` will build a report tree from an express app or router, whereas `format` is an object whose methods are named according to the three formats (`compact`, `flat` and `json`). Any of those methods can turn a report tree into a string ready to be logged.

## Troubleshooting

### Layer has been instanciated without tracing

If you get this error it means that tracing wasn't enable. It can be cause by one of tree things:

- The function `trace` has been called *after* express got imported. Make sure that you call the function as soon as possible, ideally at the top of your entry file.
- The object exported by express is not the one that express-inspector is tracing. You may have multiple versions of express used by your dependencies or something else is playing with your module cache.
- You are in an environement where the usual module cache is not being used. It is the case for example for tests run with jest. To circumvent this you need to provide a suitable _replacer_. See the section _How tracing works_ for more info.

### Object must be an express app or an express Router

Either `inspect` or `tree` has been called on an unexpected object. Check that you are indeed passing an express app or an express Router and that those are defined.

### Module doesn't seem to be compatible with express-inspector

Tracing works by proxying a specific file in the express package. If that file is not found this error is thrown. Maybe you specified the wrong module or are using an unsupported version of express.

## How tracing works

When you add a router, a middleware or a simple handler to an app or a router, express will create internally a _layer_. When that layer gets intantiated, the path is given as an argument to the constructor.

Tracing works by proxying the Layer constructor. When it is called, we save the path that is being passed as well as the current stack trace (using the `stack-trace` package).

To make express use the proxy, we first load the file that exports the Layer constructor. We then call a _replacer_, which is a function that takes the path of the file and the proxied version of Layer. The replacer that is being used by default replaces the original module in node's module cache by the proxy. That way, when you require express, node will use the Layer constructor from the cache, so the proxy instead of the regular one.

This approach has numerous caveats:

- it relies on behaviours that are very specific to the implementation; as such, any update of express may completely break the package
- it relies on node's caching behaviour; if you are in a specific environment where caching works differently (like a test runner), proxying will not work
- tracing must always be enabled before express is loaded
- if for some reason you have multiple instances of express modules you will not be able to use express-inspector

## Contributing

Test the inspector on your express app and let me know how it went by opening an issue. That would be greatly appreciated.

If you want to write some code for express-inspector, PRs are welcome!

### Installing the dependencies

The project uses yarn. After cloning the repo, execute `yarn`.

### Running the tests

Do `yarn test`.

The tests may break as they rely on snapshots that are probably not deterministic.

### Running the examples

Do `bin/run-example <name>` where `<name>` is one of the subdirectories of `examples`.

### Code style

The project uses ESLint and Prettier.
Do `yarn lint` to check the style and `yarn prettify` to fix it.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

Thanks to @mc100s for the idea!
