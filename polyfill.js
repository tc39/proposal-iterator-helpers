'use strict';

const IteratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf(
    [][Symbol.iterator](),
  ),
);

const AsyncIteratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf(
    async function* test() {}, // eslint-disable-line no-empty-function
  ).prototype,
);

const Iterator = {
  prototype: IteratorPrototype,
  asyncPrototype: AsyncIteratorPrototype,

  of(...items) {
    return items[Symbol.iterator]();
  },
};

Iterator.asyncPrototype.filter = async function* filter(cb) {
  for await (const item of this) {
    if (await cb(item)) {
      yield item;
    }
  }
};

Iterator.prototype.filter = function* filter(cb) {
  for (const item of this) {
    if (cb(item)) {
      yield item;
    }
  }
};

Iterator.asyncPrototype.map = async function* map(cb) {
  for await (const item of this) {
    yield await cb(item);
  }
};

Iterator.prototype.map = function* map(cb) {
  for (const item of this) {
    yield cb(item);
  }
};

Iterator.asyncPrototype.take = async function* take(n) {
  let taken = 0;
  for await (const item of this) {
    taken += 1;
    if (taken > n) {
      break;
    }
    yield item;
  }
};

Iterator.prototype.take = function* take(n) {
  let taken = 0;
  for (const item of this) {
    taken += 1;
    if (taken > n) {
      break;
    }
    yield item;
  }
};

Iterator.asyncPrototype.reduce = async function reduce(reducer, start) {
  let final = start;
  for await (const item of this) {
    final = await reducer(final, item);
  }
  return final;
};

Iterator.prototype.reduce = function reduce(reducer, start) {
  let final = start;
  for (const item of this) {
    final = reducer(final, item);
  }
  return final;
};

Iterator.asyncPrototype.collect = async function collect() {
  const out = [];
  for await (const item of this) {
    out.push(item);
  }
  return out;
};

Iterator.prototype.collect = function collect() {
  const out = [];
  for (const item of this) {
    out.push(item);
  }
  return out;
};

global.Iterator = Iterator;
