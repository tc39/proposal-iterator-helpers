# Details

There are number of decisions which could be made differently. This document attempts to catalog them along with the rationales for the choices currently made.

# Getting an iterator record from `this`

The added methods on `%IteratorPrototype%` assume that `this` is an iterator,
and therefore use a new `GetIteratorDirect` method to acquire an iterator
record. This means that code like `Iterator.syncPrototype.map.call([1, 2, 3], ...)`
will not work.

# Passing the protocol

All added methods attempt to pass the values and calls they receive to whatever
iterator they are wrapping. For example, `it.map(fn).next(5)` will call
`it.next(5)` instead of `it.next()`. Additionally, calls like
`it.map(fn).return()` will call upwards as well, to `it.return()`.
