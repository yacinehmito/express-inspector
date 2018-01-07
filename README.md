# express-inspector

The tool express-inspector helps you understand your express app by reporting all its routes and the files where they were defined.

**This project is early stage. The API may change often.**

## Example

Say you have the following `index.js` file:

```javascript
const express = require("express");
const inspector = require("express-inspector");

inspector.trace(express);

const app = express();

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/:name", (req, res) => {
  res.send(`Hello ${req.params.name}`);
});

inspector.inspect(app);

app.listen();
```

When executing, it will output the following lines:

```
Route /                       index.js:8:5
  GET <anonymous>             index.js:8:5
Route /:name                  index.js:12:5
  GET <anonymous>             index.js:12:5
```

To see more examples:

- clone the repo
- install the dependencies (by executing the command `yarn`)
- execute the command `examples/run <name>` where `<name>` is one of `simple`, `standard` or `sandboxed`.

## Getting Started

### Prerequisites

The package has only been tested with express 4.15.0.

### Installing

```
npm install --save-dev express-inspector
```

Or, with yarn:

```
yarn add --dev express-inspector
```

### Usage

You first need to enable tracing for the express objects.
To do so, you need to call `trace` on express before creating any express application or router (ideally at the top of your entry file).

Then you can call `inspect` on an application or on a router. It will output a nice report in your console.

Example:

```javascript
const express = require("express");
const inspector = require("express-inspector");
inspector.trace(express);

// Other calls of `require` here

const app = express();

// More of your code...

inspector.inspect(app) // Before call to `listen`
```

Of course you can disable tracing in production by first checking the value of `process.env.NODE_ENV`. See the files in `examples/standard` for an example.

## Advanced features

### Changing logger

By default, `inspect` will write the report to standard output. If you would rather plug your own logger, you can pass it as an option.

Example when using `console.info` as a logger:

```javascript
inspector.inspect(app, {
  logger: console.info
})
```

### Changing format

You can specify your own formatter to `inspect` by setting the format option.
A formatter is a function that takes a report tree as input and outputs a string.
A report tree is an object whose internal structure matches the app's or the router's.

The package comes bundled with two formatters: `compact` (the default) and `json`. You can also set the format option to one of thses strings.

Example when we only output the type of the object being inspected:

```javascript
inspector.inspect(appOrRouter, {
  format(object) {
    return object.type
  }
})
```

### Sandboxing traced express

The tracing will mutate the prototypes used by express. With the help of the modules cache it allows us to trace the whole code with minimal effort.

However, it has some downsides: it is very dependent on the order of the calls and it cannot be selectively toggled.

If you want more control over what is being traced, you can use the `express` object exported by the package where you would use the regular express.

Take a look at the files in `examples/sandboxed` for an example.

### Using the lower-level API

You can build your own `inspect` function with `tree`, `format.compact` and/or `format.json`.

The function `tree` will build a report tree from an express app or router, whereas `format.compact` and `format.json` would take such a tree and turn it into a string.

## Contributing

Test the inspector on your express app and let me know how it went by opening an issue. That would be greatly appreciated.

If you want to write some code for express-inspector, PRs are welcome!

### Installing the dependencies

The project uses yarn. After cloning the repo, execute `yarn`.

### Running the tests

Do `yarn test`.

The tests may break as they rely on snapshots that are probably not deterministic.

### Running the examples

Do `examples/run <name>` where `<name>` is one of the subdirectories of `examples`.

### Code style

The project uses ESLint and Prettier.
Do `yarn lint` to check the style and `yarn prettify` to fix it.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details

## Acknowledgments

Thanks to @mc100s for the idea!
