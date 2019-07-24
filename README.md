# Iterator Helpers

### Proposal

A proposal for several interfaces that will help with general usage and
consumption of iterators in ECMAScript. Many
[libraries and languages](#prior-art) already provide these interfaces.

This proposal is at Stage 2 of
[The Process](https://tc39.github.io/process-document/)

See [DETAILS.md](./DETAILS.md) for details on semantics decisions.

See this specification rendered [here](https://tc39.github.io/proposal-iterator-helpers)

### Example usage

```js
function* naturals() {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
}

const evens = naturals()
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

Object.setPrototypeOf(MyIteratorPrototype, Iterator.syncPrototype);
```

```js
class ObligatoryCryptocurrencyReference extends Component {
  componentWillMount() {
    const items = ticker() // returns async iterator
      .map((c) => createElement('h2', null, `${c.name}: ${c.price}`))
      .take(5) // only consume 5 items of a potentially infinite iterator
      .collect() // greedily transform async iterator into array
      .then((data) => this.setState({ data }));
  }

  render() {
    return createElement('div', null, this.state.data);
  }
}
```

### Why not use Array.from + Array.prototype methods?

All of these methods (except for reduce and collect) are **lazy**. They will
only consume the iterator when they need the next item from it. Especially
for iterators that never end, this is key. Without generic support for
any form of iterator, different iterators have to be handled differently.

### Prior Art

- https://www.npmjs.com/package/itertools
- https://www.npmjs.com/package/lodash
- https://docs.python.org/3/library/itertools.html
- https://docs.rs/itertools/
- https://doc.rust-lang.org/std/iter/trait.Iterator.html
- https://www.boost.org/doc/libs/1_66_0/libs/iterator/doc/index.html
- https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable

| Method                      | Rust | Python | npm Itertools | C# |
| --------------------------- | ---- | ------ | --------------| -- |
| all                         | ☑    | ☐      | ☑             | ☑  |
| any                         | ☑    | ☐      | ☑             | ☑  |
| chain                       | ☑    | ☑      | ☑             | ☑  |
| collect                     | ☑    | ☐      | ☐             | ☐  |
| count                       | ☑    | ☑      | ☑             | ☑  |
| cycle                       | ☑    | ☑      | ☑             | ☐  |
| enumerate                   | ☑    | ☐      | ☑             | ☐  |
| filter                      | ☑    | ☐      | ☑             | ☑  |
| filterMap                   | ☑    | ☐      | ☐             | ☐  |
| find                        | ☑    | ☐      | ☑             | ☑  |
| findMap                     | ☑    | ☐      | ☐             | ☐  |
| flatMap                     | ☑    | ☐      | ☑             | ☑  |
| flatten                     | ☑    | ☐      | ☐             | ☐  |
| forEach                     | ☑    | ☐      | ☐             | ☐  |
| last                        | ☑    | ☐      | ☐             | ☑  |
| map                         | ☑    | ☐      | ☑             | ☑  |
| max                         | ☑    | ☐      | ☑             | ☑  |
| min                         | ☑    | ☐      | ☑             | ☑  |
| nth                         | ☑    | ☐      | ☐             | ☑  |
| partition                   | ☑    | ☑      | ☐             | ☑  |
| peekable                    | ☑    | ☐      | ☐             | ☐  |
| position                    | ☑    | ☐      | ☐             | ☐  |
| product                     | ☑    | ☑      | ☐             | ☐  |
| reverse                     | ☑    | ☐      | ☐             | ☑  |
| scan                        | ☑    | ☐      | ☐             | ☐  |
| skip                        | ☑    | ☐      | ☐             | ☑  |
| skipWhile                   | ☑    | ☑      | ☐             | ☑  |
| stepBy                      | ☑    | ☐      | ☐             | ☐  |
| sum                         | ☑    | ☐      | ☑             | ☑  |
| take                        | ☑    | ☐      | ☑             | ☑  |
| takeWhile                   | ☑    | ☑      | ☐             | ☑  |
| unzip                       | ☑    | ☐      | ☐             | ☐  |
| zip                         | ☑    | ☑      | ☑             | ☑  |
| compress                    | ☐    | ☑      | ☑             | ☐  |
| permutations                | ☐    | ☑      | ☑             | ☐  |
| repeat                      | ☑    | ☑      | ☑             | ☑  |
| slice                       | ☐    | ☑      | ☑             | ☐  |
| starmap                     | ☐    | ☑      | ☐             | ☐  |
| tee                         | ☐    | ☑      | ☐             | ☐  |
| compact                     | ☐    | ☐      | ☑             | ☐  |
| contains                    | ☐    | ☐      | ☑             | ☑  |
| range                       | ☑    | ☑      | ☑             | ☑  |
| reduce                      | ☑    | ☑      | ☑             | ☑  |
| sorted                      | ☐    | ☐      | ☑             | ☐  |
| unique                      | ☐    | ☐      | ☑             | ☑  |
| average                     | ☐    | ☐      | ☐             | ☑  |
| empty                       | ☑    | ☐      | ☐             | ☑  |
| except                      | ☐    | ☐      | ☐             | ☑  |
| intersect                   | ☐    | ☐      | ☐             | ☑  |
| prepend                     | ☐    | ☐      | ☐             | ☑  |
| append                      | ☐    | ☐      | ☐             | ☑  |

Note: The method names are combined, such as `toArray` and `collect`.
