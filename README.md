# Iterator Helpers

A proposal for several interfaces that will help with general usage and
consumption of iterators in ECMAScript.

## Status

Authors: Gus Caplan, Michael Ficarra, Adam Vandolder, Jason Orendorff

Champions: Michael Ficarra, Yulia Startsev

This proposal is at Stage 2 of [The TC39 Process](https://tc39.es/process-document/).

## Motivation

Iterators are a useful way to represent large or possibly infinite enumerable data sets. However,
they lack helpers which make them as easy to use as Arrays and other finite data structures, which
results in certain problems that could be better represented by iterators being expressed in Arrays,
or using libraries to introduce the necessary helpers. Many [libraries and languages](#prior-art--userland-implementations) already provide these interfaces.

## Proposal

The proposal introduces a collection of new methods on the Iterator and AsyncIterator prototypes, to allow general
usage and consumption of iterators. For specifics on the implemented methods, please refer to the
specification.

See [DETAILS.md](./DETAILS.md) for details on semantics decisions.

See this proposal rendered [here](https://tc39.es/proposal-iterator-helpers)

## Added Methods

For Iterators and AsyncIterators we add the following methods:

### `.map(mapperFn)`

`map` takes a function as an argument. It allows users to apply a function to every element returned from an iterator.

Returns an iterator of the values with the map function applied.

#### Example

```JavaScript
function* naturals() {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
}

const result = naturals()
  .map(value => {
    return value * value;
  });
result.next(); //  {value: 0, done: false};
result.next(); //  {value: 1, done: false};
result.next(); //  {value: 4, done: false};
```

### `.filter(filtererFn)`

`filter` takes a function as an argument. It allows users to skip values from an iterator which do not pass a filter function.

Returns an iterator of values from the original iterator that pass the filter.

#### Example

```JavaScript
function* naturals() {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
}

const result = naturals()
  .filter(value => {
    return value % 2 == 0;
  });
result.next(); //  {value: 0, done: false};
result.next(); //  {value: 2, done: false};
result.next(); //  {value: 4, done: false};
```

### `.take(limit)`

`take` takes an integer as an argument. It returns an iterator that produces, at most, the given number of elements produced by the underlying iterator.

Returns an iterator with items from the original iterator from 0 until the limit.

#### Example

```JavaScript
function* naturals() {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
}

const result = naturals()
  .take(3);
result.next(); //  {value: 0, done: false};
result.next(); //  {value: 1, done: false};
result.next(); //  {value: 2, done: false};
result.next(); //  {value: undefined, done: true};
```

### `.drop(limit)`

`drop` takes an integer as an argument. It skips the given number of elements produced by the underlying iterator before itself producing any remaining elements.

Returns an iterator of items after the limit.

#### Example

```JavaScript
function* naturals() {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
}

const result = naturals()
  .drop(3);
result.next(); //  {value: 3, done: false};
result.next(); //  {value: 4, done: false};
result.next(); //  {value: 5, done: false};
```

### `.indexed()`

`.indexed` takes no arguments. It returns an iterator where each value produced by the underlying iterator is paired with a counter, starting at 0 and increasing by 1 with every element produced.

Returns an iterator of pairs.

#### Example

```JavaScript
const abc = ["a", "b", "c"].values();

const result = abc
  .indexed();
result.next(); //  {value: [0, "a"], done: false};
result.next(); //  {value: [1, "b"], done: false};
result.next(); //  {value: [2, "c"], done: false};
```

### `.flatMap(mapperFn)`

`.flatMap` takes a mapping function as an argument. It returns an iterator that produces all elements of the iterators produced by applying the mapping function to the elements produced by the underlying iterator.

Returns an iterator of flat values.

#### Example

```JavaScript
const sunny = ["It's Sunny in", "", "California"].values();

const result = sunny
  .flatMap(value => value.split(" ").values());
result.next(); //  {value: "It's", done: false};
result.next(); //  {value: "Sunny", done: false};
result.next(); //  {value: "in", done: false};
result.next(); //  {value: "", done: false};
result.next(); //  {value: "California", done: false};
result.next(); //  {value: undefined, done: true};
```

### `.reduce(reducer [, initialValue ])`

`reduce` takes a function and an optional initial value as an argument. It allows users to apply a function to every element returned from an iterator, while keeping track of the most recent result of the reducer (the memo). For the first element, the given initial value is used as the memo.

Returns a value (in the example, a number) of the type returned to the reducer function.

#### Example

```JavaScript
function* naturals() {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
}

const result = naturals()
  .take(5)
  .reduce((sum, value) => {
    return sum + value;
  }, 3);

result // 13
```

### `.toArray()`

When you have a non-infinite iterator which you wish to transform into an array, you can do so with
the builtin `toArray` method.

Returns an Array containing the values from the iterator.

#### Example

```JavaScript
function* naturals() {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
}

const result = naturals()
  .take(5)
  .toArray();

result // [0, 1, 2, 3, 4]
```

### `.forEach(fn)`

For using side effects with an iterator, you can use the `.forEach` builtin method, which takes as
an argument a function.

Returns undefined.

#### Example

```JavaScript
const log = [];
const fn = (value) => log.push(value);
const iter = [1, 2, 3].values();

iter.forEach(fn);
console.log(log.join(", ")) // "1, 2, 3"
```

### `.some(fn)`

To check if any value in the iterator matches a given predicate, `.some` can be used. It takes as an argument a function which returns true or false.


Returns a boolean which is true if any element returned true when `fn` was called on it. The
iterator is consumed when some is called.

#### Example

```JavaScript
const iter = [1, 2, 3].values();

iter.some(v => v > 1); // true
iter.some(v => true); // false, iterator is already consumed.

function* naturals() {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
}

naturals().take(4).some(v => v > 1); // true
naturals().take(4).some(v => v == 1); // true, acting on a new iterator
```

### `.every(fn)`

`.every` takes a function which returns a boolean as an argument. It is used to check if every
value generated by the iterator passes the test function.

Returns a boolean.

```JavaScript
const iter = [1, 2, 3].values();

iter.every(v => v >= 1); // true
iter.every(v => false); // true, iterator is already consumed.

function* naturals() {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
}

naturals().take(4).every(v => v > 0); // false, first value is 0
naturals().take(4).every(v => v >= 0); // true, acting on a new iterator
```

### `.find(fn)`

`.find` takes a function as an argument. It is used to find the first element in an iterator that matches.

Can be used without `take` on infinite iterators.

Returns the found element, or *undefined* if no element matches `fn`.

```JavaScript
function* naturals() {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
}

naturals().find(v => v > 1); // 2
```

### `.from(object)`

`.from` takes an object as an argument. This method allows wrapping "iterator-like" objects with an
iterator.

Returns the object if it is already an iterator, returns a wrapping iterator if the passed object
implements a callable @@iterator property.

```JavaScript
class Iter {
  next() {
    return { done: false, value: 1 };
  }
}

const iter = new Iter();
const wrapper = Iterator.from(iter);

wrapper.next() // { value: 1, done: false }
```

## More Example Usage

### Lazy Iteration over sets

Iterating over a set of URLs, asynchronously fetching each, and returning an array of their
JSON Output.

```js
const responses = await AsyncIterator.from(urls)
  .map(async (url) => {
    const response = await fetch(url);
    return response.json();
  })
  .toArray();
```

Example of iterating over a potentially infinite iterator and transforming it to an array in groups
of 5.

```js
class ObligatoryCryptocurrencyReference extends Component {
  componentWillMount() {
    const items = ticker() // returns async iterator
      .map((c) => createElement('h2', null, `${c.name}: ${c.price}`))
      .take(5) // only consume 5 items of a potentially infinite iterator
      .toArray() // greedily transform async iterator into array
      .then((data) => this.setState({ data }));
  }

  render() {
    return createElement('div', null, this.state.data);
  }
}
```

#### Extending Iterator Prototype

With this proposal, it will be easier to extend the IteratorPrototype for a custom class. See the
below example for the previous implementation compared to the new one.

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
## Implementations

Implementation tracking of Iterator Helpers

- Browsers:
  * [ ] V8
  * [ ] [SpiderMonkey](https://bugzilla.mozilla.org/show_bug.cgi?id=1568906) (feature-flagged on Nightly
      only)
  * [ ] JavaScriptCore

## Q & A

### Why not use Array.from + Array.prototype methods?

All of these methods (except for reduce and toArray) are **lazy**. They will
only consume the iterator when they need the next item from it. Especially
for iterators that never end, this is key. Without generic support for
any form of iterator, different iterators have to be handled differently.

## Prior Art & Userland implementations

- https://www.npmjs.com/package/itertools
- https://www.npmjs.com/package/lodash
- https://docs.python.org/3/library/itertools.html
- https://github.com/more-itertools/more-itertools
- https://docs.rs/itertools/
- https://doc.rust-lang.org/std/iter/trait.Iterator.html
- https://www.boost.org/doc/libs/1_66_0/libs/iterator/doc/index.html
- https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable
- https://github.com/ReactiveX/IxJS
- https://www.npmjs.com/package/ballvalve
- https://github.com/zloirock/core-js#iterator-helpers
- Node.js [Readable](https://nodejs.org/api/stream.html#readable-streams) streams implement this proposal in its entirety.


| Method                      | Rust | Python | npm Itertools | C# |
| --------------------------- | ---- | ------ | --------------| -- |
| all                         | ☑    | ☑      | ☑             | ☑  |
| any                         | ☑    | ☑      | ☑             | ☑  |
| chain                       | ☑    | ☑      | ☑             | ☑  |
| collect                     | ☑    | ☐      | ☐             | ☐  |
| count                       | ☑    | ☑      | ☑             | ☑  |
| cycle                       | ☑    | ☑      | ☑             | ☐  |
| enumerate                   | ☑    | ☑      | ☑             | ☐  |
| filter                      | ☑    | ☑      | ☑             | ☑  |
| filterMap                   | ☑    | ☐      | ☐             | ☐  |
| find                        | ☑    | ☐      | ☑             | ☑  |
| findMap                     | ☑    | ☐      | ☐             | ☐  |
| flatMap                     | ☑    | ☐      | ☑             | ☑  |
| flatten                     | ☑    | ☐      | ☐             | ☐  |
| forEach                     | ☑    | ☐      | ☐             | ☐  |
| last                        | ☑    | ☐      | ☐             | ☑  |
| map                         | ☑    | ☑      | ☑             | ☑  |
| max                         | ☑    | ☑      | ☑             | ☑  |
| min                         | ☑    | ☑      | ☑             | ☑  |
| nth                         | ☑    | ☐      | ☐             | ☑  |
| partition                   | ☑    | ☐      | ☐             | ☑  |
| peekable                    | ☑    | ☐      | ☐             | ☐  |
| position                    | ☑    | ☐      | ☐             | ☐  |
| product                     | ☑    | ☑      | ☐             | ☐  |
| reverse                     | ☑    | ☑      | ☐             | ☑  |
| scan                        | ☑    | ☐      | ☐             | ☐  |
| skip                        | ☑    | ☐      | ☐             | ☑  |
| skipWhile                   | ☑    | ☑      | ☐             | ☑  |
| stepBy                      | ☑    | ☐      | ☐             | ☐  |
| sum                         | ☑    | ☑      | ☑             | ☑  |
| take                        | ☑    | ☐      | ☑             | ☑  |
| takeWhile                   | ☑    | ☑      | ☐             | ☑  |
| unzip                       | ☑    | ☑      | ☑             | ☐  |
| zip                         | ☑    | ☑      | ☑             | ☑  |
| compress                    | ☐    | ☑      | ☑             | ☐  |
| permutations                | ☐    | ☑      | ☑             | ☐  |
| repeat                      | ☑    | ☑      | ☑             | ☑  |
| slice                       | ☐    | ☑      | ☑             | ☐  |
| starmap                     | ☐    | ☑      | ☐             | ☐  |
| tee                         | ☐    | ☑      | ☐             | ☐  |
| compact                     | ☐    | ☐      | ☑             | ☐  |
| contains                    | ☐    | ☑      | ☑             | ☑  |
| range                       | ☑    | ☑      | ☑             | ☑  |
| reduce                      | ☑    | ☑      | ☑             | ☑  |
| sorted                      | ☐    | ☑      | ☑             | ☐  |
| unique                      | ☐    | ☐      | ☑             | ☑  |
| average                     | ☐    | ☐      | ☐             | ☑  |
| empty                       | ☑    | ☐      | ☐             | ☑  |
| except                      | ☐    | ☐      | ☐             | ☑  |
| intersect                   | ☐    | ☐      | ☐             | ☑  |
| prepend                     | ☐    | ☐      | ☐             | ☑  |
| append                      | ☐    | ☐      | ☐             | ☑  |

Note: The method names are combined, such as `toArray` and `collect`.
