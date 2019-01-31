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
     - Create an iterable from `items`. Basically
       `return items[Symbol.iterator]()`

Additions to `%IteratorPrototype%`

- `filter(callbackfn)`
- `map(callbackfn)`
- `take(n)`
  - Returns an iterator that yields the first `n` elements. Useful for making
    an infinite iterator finite.
- `reduce(callbackfn)`
  - Consume the entire iterator, using `callbackfn` as a reducer.
- `collect()`
  - Create an array from the iterator
  - `Iterator.of(1, 2, 3).collect() // [1, 2, 3]`
  - This is in the same space as `Array.from`, but is included to keep symmetry
    with `Iterator.asyncPrototype.collect`

Additions to `%AsyncIteratorPrototype%`

- `filter(callbackfn)`
- `map(callbackfn)`
- `take(n)`
  - Returns an iterator that yields the first `n` elements. Useful for making
    an infinite iterator finite.
- `reduce(callbackfn)`
  - Consume the entire iterator, using `callbackfn` as the reducer.
- `collect()`
  - Create an array from the iterator
  - `asyncIt.collect().then((items) => { console.log(items[2]); })`

### Example usage

```js
function* nats() {
  let nat = 0;
  do { yield nat; ++nat; } while(true);
}

const evens = nats()
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

```js
class ObligatoryCryptocurrencyReference extends Component {
  componentWillMount() {
    const items = ticker()
      .map((c) => (<h2>{`${c.name}: ${c.price}`}</h2>))
      .take(5) // only consume 5 items of a potentially infinite iterator
      .collect() // greedily transform async iterator into array
      .then((data) => this.setState({ data }));
  }

  render() {
    return <div>{this.data}</div>
  }
}
```

### Why not use Array.from + Array.prototype methods?

All of these methods (except for reduce and collect) are **lazy**. They will
only consume the iterable when they need the next item from it. Especially
for iterators that never end, this is key. Without generic support for
any form of iterator, different iterators have to be handled differently.

### Prior Art

- https://www.npmjs.com/package/itertools
- https://www.npmjs.com/package/lodash
- https://docs.python.org/3/library/itertools.html
- https://docs.rs/itertools/
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
| repeat                      | ☐    | ☑      | ☑             | ☑  |
| slice                       | ☐    | ☑      | ☑             | ☐  |
| starmap                     | ☐    | ☑      | ☐             | ☐  |
| tee                         | ☐    | ☑      | ☐             | ☐  |
| compact                     | ☐    | ☐      | ☑             | ☐  |
| contains                    | ☐    | ☐      | ☑             | ☑  |
| range                       | ☐    | ☐      | ☑             | ☑  |
| reduce                      | ☑    | ☑      | ☑             | ☑  |
| sorted                      | ☐    | ☐      | ☑             | ☐  |
| unique                      | ☐    | ☐      | ☑             | ☑  |
| average                     | ☐    | ☐      | ☐             | ☑  |
| empty                       | ☐    | ☐      | ☐             | ☑  |
| except                      | ☐    | ☐      | ☐             | ☑  |
| intersect                   | ☐    | ☐      | ☐             | ☑  |
| prepend                     | ☐    | ☐      | ☐             | ☑  |
| append                      | ☐    | ☐      | ☐             | ☑  |

Note: The method names are combined, such as `toArray` and `collect`.
