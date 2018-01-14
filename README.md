# express-inspector

The tool express-inspector helps you understand your express app by reporting all its routes and the files where they were defined.

**This project is early stage. The API may change often.**

## Example

Say you have the following `index.js` file:

```javascript
const inspector = require("express-inspector");
inspector.trace();
const express = require("express");

const app = express();

app.get("/:name", (req, res) => {
  res.send(`Hello ${req.params.name}`);
});

inspector.inspect(app);

app.listen();
```

When executing, it will output the following lines:

```
Route /:name             index.js:7:5
GET / <anonymous>        index.js:7:5
```

Obviously it gets more interesting if you have more complicated setup.

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
To do so, you need to call `trace` before requiring express. 

Then you can call `inspect` on an application or on a router. It will output a nice report in your console.

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

Of course you can disable tracing in production by first checking the value of `process.env.NODE_ENV`. See the file in `examples/standard/index.js` for an example.

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

The package comes bundled with two formatters: `compact` (the default) and `json`. You can also set the format option to one of theses strings.

Example when we only output the type of the object being inspected:

```javascript
inspector.inspect(appOrRouter, {
  format(object) {
    return object.type
  }
})
```

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
