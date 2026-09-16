# Rolldown UMD HMR issue reproduction

This repo is a reproduction of the bug that causes HMR graph to be empty when executing initial bundle in UMD format.

## How to reproduce?

Run the following command:

```sh
node dev.mjs
```

You'll see that esm output will correctly register the HMR graph:

```
[esm]
Accepted: src/component.js
Importers of "dependency.js": src/component.js -> Correct!
```

But umd output doesn't include the `__rolldown_runtime__.registerGraph()` statement which causes the graph to be empty:

```
[umd]
Accepted: src/component.js
Importers of "dependency.js": -> Nothing here...
```
