# EBDD · [![npm version][npm badge]][npm url]

## Installation

```console
npm install --save-dev ebdd
```

## Usage

### Command line

Run Mocha with additional parameter `--ui=ebdd`.

### Node.js

Just set `ui` to `"ebdd"` in Mocha options, e.g.
```js
const mocha = new Mocha({ ui: "ebdd" });
```

If you are using TypeScript, import the _ebbd_ module in your code to use ebdd type information.

```ts
import "ebdd";
```
or
```ts
import type { } from "ebdd";
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

[npm badge]: https://badge.fury.io/js/ebdd.svg
[npm url]: https://www.npmjs.com/package/ebdd
