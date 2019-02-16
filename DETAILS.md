# Details

There are number of decisions which could be made differently. This document attempts to catalog them along with the rationales for the choices currently made.

## Getting an iterator record from `this`

The added methods on `%IteratorPrototype%` assume that `this` is an iterator,
and therefore use a new `GetIteratorDirect` method to acquire an iterator
record. This means that code like `Iterator.syncPrototype.map.call([1, 2, 3], ...)`
will not work.

## Passing the protocol

All added methods attempt to pass the values and calls they receive to whatever
iterator they are wrapping. For example, `it.map(fn).next(5)` will call
`it.next(5)` instead of `it.next()`. Additionally, calls like
`it.map(fn).return()` will call upwards as well, to `it.return()`.

## Interface constraints

- The interface used to expose these methods must not clash with existing APIs.
  For example: `Array.prototype.map` or `Map.prototype.forEach` denying access
  to the interface.
- It must work with everywhere an iteration can occur.
  For example: `%GeneratorFunction%.prototype.map` will not work because the
  interface has to be obtained from an explicit function call.
  `%GeneratorFunction%.prototype` has no symbolic API to get the iterator.
