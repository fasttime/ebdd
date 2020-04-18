## Installation

```console
npm install --save-dev ebdd
```

## Usage

### Command line

Run Mocha with additional parameters `--require ebdd --ui ebdd`.

### Node.js

You don't need to require the _ebbd_ module in your code. Just set `ui` to `"ebdd"` in Mocha
options, e.g.
```js
const mocha = new Mocha({ ui: "ebdd" });
```

### Browser

Load the script _ebbd.js_ in the _ebbd_ package, then call `mocha.setup` with option `ui` set to
`"ebdd"`, e.g.
```html
<script src="node_modules/mocha/mocha.js"></script>
<script src="node_modules/ebdd/ebdd.js"></script>
<script>
mocha.setup({ ui: "ebdd" });
</script>
<!-- Add tests here. -->
<script>
mocha.run();
</script>
```
