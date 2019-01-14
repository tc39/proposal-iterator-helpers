# Iterator Helpers

### Proposal

A proposal for several interfaces that will help with general usage and
consumption of iterators in ECMAScript.

Stage 0 - Has not been presented to the committee 

The following additions are proposed to enable simple and powerful methods of
interacting with iterators in ECMAScript. 

Many [libraries and languages](#prior-art) already provide these interfaces.

Additions to the Global Object.

- `Iterator` global namespace
  - `prototype` => `%IteratorPrototype%`
  - `asyncPrototype` => `%AsyncIteratorPrototype%`
  - `of(...items)`
  - `*range(start, stop, step = 1)`

Additions to `%IteratorPrototype%`

- `*filter(callbackfn)`
- `*map(callbackfn)`
- `reduce(callbackfn)`
- `collect()`

Additions to `%AsyncIteratorPrototype%`

- `async *filter(callbackfn)`
- `async *map(callbackfn)`
- `async reduce(callbackfn)`
- `async collect()`

### Example usage

```js
const evens = Iterator
  .range(0, Infinity) // or range(0, Infinity, 2)
  .filter((n) => n % 2 === 0);

for (const even of evens) {
  console.log(even, 'is an even number');
}
```

```js
const MyIteratorPrototype = {
  next() {},
  throw() {},
  return() {},

  // but we don't properly implement %IteratorPrototype%!!!
};

// Previously...
// Object.setPrototypeOf(MyIteratorPrototype,
//   Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.setPrototypeOf(MyIteratorPrototype, Iterator.prototype);
```

### Further work

A lot of other languages have more contrived methods such as `zip`, `fold`,
`flat`, `max`, etc. Should we include these?

### Prior Art

- https://www.npmjs.com/package/itertools
- https://www.npmjs.com/package/lodash
- https://docs.python.org/3/library/itertools.html
- https://docs.rs/itertools/
- https://www.boost.org/doc/libs/1_66_0/libs/iterator/doc/index.html
- https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable
