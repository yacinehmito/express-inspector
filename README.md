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

## Troubleshooting

### Layer has been instanciated without tracing

If get this error it means that tracing wasn't enable. It can be cause by one of tree things:

- The function `trace` has been called *after* express got imported. Make sure that you call the function as soon as possible, ideally at the top of your entry file.
- The object exported by express is not the one that express-inspector is tracing. You may have multiple versions of express used by your dependencies or something else is playing with your module cache.
- You are in an environement where the usual module cache is not being used. It is the case for example for tests run with jest. The circumvent this you need to provide a suitable _replacer_. See the section _How tracing works_ for more info.

### Object must be an express app or an express Router

Either `inspect` or `tree` has been called on an unexpected object. Check that you are indeed passing an express app or an express Router and that those are defined.

### Module doesn't seem to be compatible with express-inspector

Tracing works by proxying a specific file in the express package. If that file is not found this error is thrown. Maybe you specified the wrong module or are using an unsupported version of express.

## How tracing works

When you add a router, a middleware or a simple handler to an app or a router, express will create internally a _layer_. When that layer gets intanciated, the path is given as an argument to the constructor.

Tracing works by proxying the Layer constructor. When it is called, we save the path that is being passed as well as the current stack-trace (using the `stack-trace` package).

To make express use the proxy, we first load the file that exports the Layer constructor. We then call a _replacer_, which is a function that takes the path of the file and the proxied version of Layer. The replacer that is being used by default replaces the original module in node's module cache by the proxy. That way, when you require express, node will use the Layer constructor from the cache, so the proxy instead of the regular one.

This approach has numerous caveats:

- it relies on behaviours that are very specific to the implementation; as such, any update of express may completely break the package
- it relies on node's caching behaviour; if you are in a specific environment where caching works differently (like a test runner), proxying will not work
- tracing must always be enabled before express is loaded
- if for some reason you have multiple instances of express modules you will not be able to use express-inspector

## Advanced features

### Changing logger

By default, `inspect` will write the report to standard output. If you would rather plug your own logger, you can pass it as an option.

Example when writing the report to standard error:

```javascript
inspector.inspect(app, {
  logger(report) {
    process.stderr.write(report);
  }
})
```

### Changing format

You can specify your own formatter to `inspect` by setting the format option.
A formatter is a function that takes a report tree as input and outputs a string.
A report tree is an object whose internal structure matches the app's or the router's.

The package comes bundled with three formatters: `compact` (the default), `flat` and `json`. You can also set the format option to one of theses strings.

Example when we only output the type of the object being inspected:

```javascript
inspector.inspect(appOrRouter, {
  format(object) {
    return object.type
  }
})
```

### Using the lower-level API

You can build your own `inspect` function with `tree` and `format`.

The function `tree` will build a report tree from an express app or router, whereas `format` is an object whose methods can turn such a tree into a string ready to be logged.

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
