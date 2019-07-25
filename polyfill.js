'use strict';

// This is a polyfill for demonstration, not for compat.
// It has terrible horrible performance and will clobber
// existing methods. Do not use this in your code base.

/* eslint-disable no-await-in-loop */
/* eslint-disable no-constant-condition */

const ES = require('es-abstract');

// es-abstract doesn't support ES2019
ES.GetIterator = function GetIterator(obj, hint = 'sync', method) {
  if (method === undefined) {
    if (hint === 'async') {
      method = ES.GetMethod(obj, Symbol.asyncIterator);
      if (method === undefined) {
        // const syncMethod = ES.GetMethod(obj, Symbol.iterator);
        // const syncIteratorRecord = GetIterator(obj, 'sync', syncMethod);
        // return CreateAsyncFromSyncIterator(syncIteratorRecord);
        throw new TypeError('CreateAsyncFromSyncIterator :(');
      }
    }
    method = ES.GetMethod(obj, Symbol.iterator);
  }
  const iterator = ES.Call(method, obj);
  if (ES.Type(iterator) !== 'Object') {
    throw new TypeError();
  }
  const nextMethod = ES.GetV(obj, 'next');
  const iteratorRecord = {
    Iterator: iterator,
    NextMethod: nextMethod,
    Done: false,
  };
  return iteratorRecord;
};

// es-abstract doesn't support ES2019
ES.IteratorNext = function IteratorNext(iteratorRecord, value) {
  let result;
  if (arguments.length === 1) { // if _value_ is not present
    result = ES.Call(iteratorRecord.NextMethod, iteratorRecord.Iterator, []);
  } else {
    result = ES.Call(iteratorRecord.NextMethod, iteratorRecord.Iterator, [value]);
  }
  if (ES.Type(result) !== 'Object') {
    throw new TypeError();
  }
  return result;
};

// es-abstract doesn't support ES2019
ES.IteratorClose = function IteratorClose(iteratorRecord, completion) {
  const iterator = iteratorRecord.Iterator;
  const $return = ES.GetMethod(iterator, 'return');
  if ($return === undefined) {
    return completion();
  }
  let innerResult;
  let completionThunk = completion;
  let completionRecord;
  try {
    innerResult = ES.Call($return, iterator, []);
  } catch (e) {
    completionRecord = completionThunk();
    completionThunk = undefined;
    throw e;
  }
  if (completionThunk) {
    completionRecord = completionThunk();
    completionThunk = undefined;
  }
  if (ES.Type(innerResult) !== 'Object') {
    throw new TypeError();
  }
  return completionRecord;
};

// es-abstract doesn't support ES2019
ES.AsyncIteratorClose = async function AsyncIteratorClose(iteratorRecord, completion) {
  const iterator = iteratorRecord.Iterator;
  const $return = ES.GetMethod(iterator, 'return');
  if ($return === undefined) {
    return completion();
  }
  let innerResult;
  let completionThunk = completion;
  let completionRecord;
  try {
    innerResult = await ES.Call($return, iterator, []);
  } catch (e) {
    completionRecord = completionThunk();
    completionThunk = undefined;
    throw e;
  }
  if (completionThunk) {
    completionRecord = completionThunk();
    completionThunk = undefined;
  }
  if (ES.Type(innerResult) !== 'Object') {
    throw new TypeError();
  }
  return completionRecord;
};

ES.NewPromiseCapability = function NewPromiseCapability(C) {
  if (ES.IsConstructor(C) === false) {
    throw new TypeError();
  }
  const promiseCapability = {
    Promise: undefined,
    Resolve: undefined,
    Reject: undefined,
  };
  const steps = (0, (resolve, reject) => {
    if (promiseCapability.Resolve !== undefined) {
      throw new TypeError();
    }
    if (promiseCapability.Reject !== undefined) {
      throw new TypeError();
    }
    promiseCapability.Resolve = resolve;
    promiseCapability.Reject = reject;
    return undefined;
  });
  const executor = steps;
  executor.Capability = promiseCapability;
  const promise = new C(executor);
  if (ES.IsCallable(promiseCapability.Resolve) === false) {
    throw new TypeError();
  }
  if (ES.IsCallable(promiseCapability.Reject) === false) {
    throw new TypeError();
  }
  promiseCapability.Promise = promise;
  return promiseCapability;
};

ES.CreateArrayFromList = (array) => array;

function GetIteratorDirect(obj) {
  if (ES.Type(obj) !== 'Object') {
    throw new TypeError();
  }
  const nextMethod = ES.GetV(obj, 'next');
  const iteratorRecord = {
    Iterator: obj,
    NextMethod: nextMethod,
    Done: false,
  };
  return iteratorRecord;
}

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

function NonConstructorHasInstance(P, O) {
  while (true) {
    O = Object.getPrototypeOf(O);
    if (O === null) {
      return false;
    }
    if (ES.SameValue(O, P)) {
      return true;
    }
  }
}

function IteratorPrototypeNextPass(value) {
  const O = this;
  if (ES.Type(O) !== 'Object') {
    throw new TypeError();
  }
  if (!('Iterated' in O)) {
    throw new TypeError();
  }
  const iterated = O.Iterated;
  return ES.IteratorNext(iterated, value);
}

function IteratorPrototypeReturnPass(value) {
  const O = this;
  if (ES.Type(O) !== 'Object') {
    throw new TypeError();
  }
  if (!('Iterated' in O)) {
    throw new TypeError();
  }
  const iterated = O.Iterated;
  const $return = ES.GetMethod(iterated.Iterator, 'return');
  if ($return === undefined) {
    return ES.CreateIterResultObject(value, true);
  }
  return ES.Call($return, iterated.Iterator, [value]);
}

function IteratorPrototypeThrowPass(value) {
  const O = this;
  if (ES.Type(O) !== 'Object') {
    throw new TypeError();
  }
  if (!('Iterated' in O)) {
    throw new TypeError();
  }
  const iterated = O.Iterated;
  const $throw = ES.GetMethod(iterated.Iterator, 'throw');
  if ($throw === undefined) {
    throw value;
  }
  return ES.Call($throw, iterated.Iterator, [value]);
}

const WrapForValidIteratorPrototype = Object.setPrototypeOf({
  next: IteratorPrototypeNextPass,
  return: IteratorPrototypeReturnPass,
  throw: IteratorPrototypeThrowPass,
  [Symbol.toStringTag]: 'TBD',
}, IteratorPrototype);

function IteratorFrom(O) {
  if (ES.Type(O) !== 'Object') {
    throw new TypeError();
  }
  let iteratorRecord;
  if (ES.HasProperty(O, Symbol.iterator) === true) {
    iteratorRecord = ES.GetIterator(O);
    const hasPrototype = NonConstructorHasInstance(IteratorPrototype, iteratorRecord.Iterator);
    if (hasPrototype === true) {
      return iteratorRecord.Iterator;
    }
  } else {
    iteratorRecord = GetIteratorDirect(O);
  }
  const wrapper = ES.ObjectCreate(WrapForValidIteratorPrototype, [
    // 'Iterated',
  ]);
  wrapper.Iterated = iteratorRecord;
  return wrapper;
}

function AsyncIteratorFrom(O) {
  if (ES.Type(O) !== 'Object') {
    throw new TypeError();
  }
  let iteratorRecord;
  if (ES.HasProperty(O, Symbol.iterator) === true) {
    iteratorRecord = ES.GetIterator(O, 'async');
    const hasPrototype = NonConstructorHasInstance(IteratorPrototype, iteratorRecord.Iterator);
    if (hasPrototype === true) {
      return iteratorRecord.Iterator;
    }
  } else {
    iteratorRecord = GetIteratorDirect(O);
  }
  const wrapper = ES.ObjectCreate(WrapForValidIteratorPrototype, [
    // 'Iterated',
  ]);
  wrapper.Iterated = iteratorRecord;
  return wrapper;
}

const Iterator = {
  prototype: IteratorPrototype,
  from: IteratorFrom,
};

const AsyncIterator = {
  prototype: AsyncIteratorPrototype,
  from: AsyncIteratorFrom,
};

module.exports = { Iterator, AsyncIterator };
global.Iterator = Iterator;
global.AsyncIterator = AsyncIterator;

const IteratorPrototypeMapIteratorPrototype = Object.setPrototypeOf({
  next(v) {
    const O = this;
    if (ES.Type(O) !== 'Object') {
      throw new TypeError();
    }
    if (!('Mapper' in O && 'Iterated' in O)) {
      throw new TypeError();
    }
    const mapper = O.Mapper;
    const iterated = O.Iterated;
    const next = ES.IteratorStep(iterated, v);
    if (next === false) {
      return ES.CreateIterResultObject(undefined, true);
    }
    const value = ES.IteratorValue(next);
    try {
      const mapped = ES.Call(mapper, undefined, [value]);
      return ES.CreateIterResultObject(mapped, false);
    } catch (e) {
      return ES.IteratorClose(iterated, () => {
        throw e;
      });
    }
  },
  return: IteratorPrototypeReturnPass,
  throw: IteratorPrototypeThrowPass,
  [Symbol.toStringTag]: 'TBD',
}, Iterator.syncPrototype);

Iterator.syncPrototype.map = function map(mapper) {
  const iterated = GetIteratorDirect(this);
  if (ES.IsCallable(mapper) === false) {
    throw new TypeError();
  }
  const iterator = ES.ObjectCreate(IteratorPrototypeMapIteratorPrototype, [
    // 'Mapper',
    // 'Iterated',
  ]);
  iterator.Mapper = mapper;
  iterator.Iterated = iterated;
  return iterator;
};

const IteratorPrototypeFilterIteratorPrototype = Object.setPrototypeOf({
  next(v) {
    const O = this;
    if (ES.Type(O) !== 'Object') {
      throw new TypeError();
    }
    if (!('Filterer' in O && 'Iterated' in O)) {
      throw new TypeError();
    }
    const filterer = O.Filterer;
    const iterated = O.Iterated;
    while (true) {
      const next = ES.IteratorStep(iterated, v);
      if (next === false) {
        return ES.CreateIterResultObject(undefined, true);
      }
      const value = ES.IteratorValue(next);
      try {
        const selected = ES.Call(filterer, undefined, [value]);
        if (ES.ToBoolean(selected) === true) {
          return ES.CreateIterResultObject(value, false);
        }
      } catch (e) {
        return ES.IteratorClose(iterated, () => {
          throw e;
        });
      }
    }
  },
  return: IteratorPrototypeReturnPass,
  throw: IteratorPrototypeThrowPass,
  [Symbol.toStringTag]: 'TBD',
}, Iterator.syncPrototype);

Iterator.syncPrototype.filter = function filter(filterer) {
  const iterated = GetIteratorDirect(this);
  if (ES.IsCallable(filterer) === false) {
    throw new TypeError();
  }
  const iterator = ES.ObjectCreate(IteratorPrototypeFilterIteratorPrototype, [
    // 'Filterer',
    // 'Iterated',
  ]);
  iterator.Filterer = filterer;
  iterator.Iterated = iterated;
  return iterator;
};

const IteratorPrototypeTakeIteratorPrototype = Object.setPrototypeOf({
  next(v) {
    const O = this;
    if (ES.Type(O) !== 'Object') {
      throw new TypeError();
    }
    if (!('Remaining' in O && 'Iterated' in O)) {
      throw new TypeError();
    }
    const remaining = O.Remaining;
    if (remaining === 0) {
      return ES.CreateIterResultObject(undefined, true);
    }
    O.Remaining = remaining - 1;
    const iterated = O.Iterated;
    return ES.IteratorNext(iterated, v);
  },
  return: IteratorPrototypeReturnPass,
  throw: IteratorPrototypeThrowPass,
  [Symbol.toStringTag]: 'TBD',
}, Iterator.syncPrototype);

Iterator.syncPrototype.take = function take(n) {
  const iterated = GetIteratorDirect(this);
  const remaining = ES.ToNumber(n);
  const iterator = ES.ObjectCreate(IteratorPrototypeTakeIteratorPrototype, [
    // 'Remaining',
    // 'Iterated',
  ]);
  iterator.Remaining = remaining;
  iterator.Iterated = iterated;
  return iterator;
};

const IteratorPrototypeDropIteratorPrototype = Object.setPrototypeOf({
  next(v) {
    const O = this;
    if (ES.Type(O) !== 'Object') {
      throw new TypeError();
    }
    if (!('Remaining' in O && 'Iterated' in O)) {
      throw new TypeError();
    }
    let remaining = O.Remaining;
    const iterated = O.Iterated;
    if (remaining === 0) {
      return ES.IteratorNext(iterated, v);
    }
    O.Remaining = 0;
    while (remaining > 0) {
      ES.IteratorNext(iterated, undefined);
      remaining -= 1;
    }
    return ES.IteratorNext(iterated, v);
  },
  return: IteratorPrototypeReturnPass,
  throw: IteratorPrototypeThrowPass,
  [Symbol.toStringTag]: 'TBD',
}, Iterator.syncPrototype);

Iterator.syncPrototype.drop = function drop(n) {
  const iterated = GetIteratorDirect(this);
  const remaining = ES.ToNumber(n);
  const iterator = ES.ObjectCreate(IteratorPrototypeDropIteratorPrototype, [
    // 'Remaining',
    // 'Iterated',
  ]);
  iterator.Remaining = remaining;
  iterator.Iterated = iterated;
  return iterator;
};

const IteratorPrototypeEnumerateIteratorPrototype = Object.setPrototypeOf({
  next(v) {
    const O = this;
    if (ES.Type(O) !== 'Object') {
      throw new TypeError();
    }
    if (!('Index' in O && 'Iterated' in O)) {
      throw new TypeError();
    }
    const index = O.Index;
    O.Index = index + 1;
    const iterated = O.Iterated;
    const next = ES.IteratorStep(iterated, v);
    if (next === false) {
      return ES.CreateIterResultObject(undefined, true);
    }
    const value = ES.IteratorValue(next);
    const pair = ES.CreateArrayFromList([index, value]);
    return ES.CreateIterResultObject(pair, false);
  },
  return: IteratorPrototypeReturnPass,
  throw: IteratorPrototypeThrowPass,
  [Symbol.toStringTag]: 'TBD',
}, Iterator.syncPrototype);


Iterator.syncPrototype.asIndexedPairs = function asIndexedPairs() {
  const iterated = GetIteratorDirect(this);
  const iterator = ES.ObjectCreate(IteratorPrototypeEnumerateIteratorPrototype, [
    // 'Index',
    // 'Iterated',
  ]);
  iterator.Index = 0;
  iterator.Iterated = iterated;
  return iterator;
};

Iterator.syncPrototype.reduce = function reduce(reducer, initialValue) {
  const iterated = GetIteratorDirect(this);
  if (ES.IsCallable(reducer) === false) {
    throw new TypeError();
  }
  let accumulator = initialValue;
  while (true) {
    const next = ES.IteratorStep(iterated);
    if (next === false) {
      return accumulator;
    }
    const value = ES.IteratorValue(next);
    try {
      const result = ES.Call(reducer, undefined, [accumulator, value]);
      accumulator = result;
    } catch (e) {
      return ES.IteratorClose(iterated, () => {
        throw e;
      });
    }
  }
};

Iterator.syncPrototype.toArray = function toArray() {
  const iterated = GetIteratorDirect(this);
  const items = [];
  while (true) {
    const next = ES.IteratorStep(iterated);
    if (next === false) {
      return items;
    }
    const value = ES.IteratorValue(next);
    items.push(value);
  }
};

Iterator.syncPrototype.forEach = function forEach(fn) {
  const iterated = GetIteratorDirect(this);
  while (true) {
    const next = ES.IteratorStep(iterated);
    if (next === false) {
      return undefined;
    }
    const value = ES.IteratorValue(next);
    ES.Call(fn, undefined, [value]);
  }
};

Iterator.syncPrototype.some = function some(fn) {
  const iterated = GetIteratorDirect(this);
  while (true) {
    const next = ES.IteratorStep(iterated);
    if (next === false) {
      return false;
    }
    const value = ES.IteratorValue(next);
    const result = ES.ToBoolean(ES.Call(fn, undefined, [value]));
    if (result === true) {
      return true;
    }
  }
};

Iterator.syncPrototype.every = function every(fn) {
  const iterated = GetIteratorDirect(this);
  while (true) {
    const next = ES.IteratorStep(iterated);
    if (next === false) {
      return true;
    }
    const value = ES.IteratorValue(next);
    const result = ES.ToBoolean(ES.Call(fn, undefined, [value]));
    if (result === false) {
      return false;
    }
  }
};

Iterator.syncPrototype.find = function find(fn) {
  const iterated = GetIteratorDirect(this);
  while (true) {
    const next = ES.IteratorStep(iterated);
    if (next === false) {
      return undefined;
    }
    const value = ES.IteratorValue(next);
    const result = ES.ToBoolean(ES.Call(fn, undefined, [value]));
    if (result === true) {
      return value;
    }
  }
};

const AsyncIteratorPrototypeMapIteratorPrototype = Object.setPrototypeOf({
  async next(v) {
    const O = this;
    const promiseCapability = ES.NewPromiseCapability(Promise);
    if (ES.Type(O) !== 'Object' || !('Mapper' in O && 'Iterated' in O)) {
      const invalidIteratorError = new TypeError();
      ES.Call(promiseCapability.Reject, undefined, [invalidIteratorError]);
      return promiseCapability.Promise;
    }
    const mapper = O.Mapper;
    const iterated = O.Iterated;
    let next;
    try { // IfAbruptRejectPromise
      next = ES.IteratorNext(iterated, v);
    } catch (e) {
      ES.Call(promiseCapability.Reject, undefined, [e]);
      return promiseCapability.Promise;
    }
    next = await next;
    let done;
    try { // IfAbruptRejectPromise
      done = ES.IteratorComplete(next);
    } catch (e) {
      ES.Call(promiseCapability.Reject, undefined, [e]);
      return promiseCapability.Promise;
    }
    if (done === true) {
      const iterResultObject = ES.CreateIterResultObject(undefined, true);
      ES.Call(promiseCapability.Resolve, undefined, [iterResultObject]);
      return promiseCapability.Promise;
    }
    let value;
    try { // IfAbruptRejectPromise
      value = ES.IteratorValue(next);
    } catch (e) {
      ES.Call(promiseCapability.Reject, undefined, [e]);
      return promiseCapability.Promise;
    }
    let mapped;
    try { // IfAbruptRejectPromise
      mapped = ES.Call(mapper, undefined, [value]);
    } catch (e) {
      ES.Call(promiseCapability.Reject, undefined, [e]);
      return promiseCapability.Promise;
    }
    mapped = await mapped;
    const iterResultObject = ES.CreateIterResultObject(mapped, false);
    ES.Call(promiseCapability.Resolve, undefined, [iterResultObject]);
    return promiseCapability.Promise;
  },
  return: IteratorPrototypeReturnPass,
  throw: IteratorPrototypeThrowPass,
  [Symbol.toStringTag]: 'TBD',
}, Iterator.asyncPrototype);

Iterator.asyncPrototype.map = function map(mapper) {
  if (ES.IsCallable(mapper) === false) {
    throw new TypeError();
  }
  const iterated = GetIteratorDirect(this, 'async');
  const iterator = ES.ObjectCreate(AsyncIteratorPrototypeMapIteratorPrototype, [
    // 'Mapper',
    // 'Iterated',
  ]);
  iterator.Mapper = mapper;
  iterator.Iterated = iterated;
  return iterator;
};

const AsyncIteratorPrototypeFilterIteratorPrototype = Object.setPrototypeOf({
  async next(v) {
    const O = this;
    if (ES.Type(O) !== 'Object') {
      throw new TypeError();
    }
    if (!('AsyncFilterer' in O && 'Iterated' in O)) {
      throw new TypeError();
    }
    const filterer = O.AsyncFilterer;
    const iterated = O.Iterated;
    while (true) {
      const next = await ES.IteratorNext(iterated, v);
      const done = ES.IteratorComplete(next);
      if (done === true) {
        await ES.AsyncIteratorClose(iterated, () => undefined);
        return ES.CreateIterResultObject(undefined, true);
      }
      const value = ES.IteratorValue(next);
      const selected = ES.ToBoolean(await ES.Call(filterer, undefined, [value]));
      if (selected === true) {
        return ES.CreateIterResultObject(value, false);
      }
    }
  },
  return: IteratorPrototypeReturnPass,
  throw: IteratorPrototypeThrowPass,
  [Symbol.toStringTag]: 'TBD',
}, Iterator.asyncPrototype);

Iterator.asyncPrototype.filter = function filter(filterer) {
  if (ES.IsCallable(filterer) === false) {
    throw new TypeError();
  }
  const iterated = GetIteratorDirect(this, 'async');
  const iterator = ES.ObjectCreate(AsyncIteratorPrototypeFilterIteratorPrototype, [
    // 'AsyncFilterer',
    // 'Iterated',
  ]);
  iterator.AsyncFilterer = filterer;
  iterator.Iterated = iterated;
  return iterator;
};

const AsyncIteratorPrototypeTakeIteratorPrototype = Object.setPrototypeOf({
  async next(v) {
    const O = this;
    if (ES.Type(O) !== 'Object') {
      throw new TypeError();
    }
    if (!('Limit' in O && 'AsyncTaken' in O && 'Iterated' in O)) {
      throw new TypeError();
    }
    const limit = O.Limit;
    const taken = O.AsyncTaken + 1;
    O.AsyncTaken = taken;
    const iterated = O.Iterated;
    if (taken > limit) {
      await ES.AsyncIteratorClose(iterated, () => undefined);
      return ES.CreateIterResultObject(undefined, true);
    }
    return ES.IteratorNext(iterated, v);
  },
  return: IteratorPrototypeReturnPass,
  throw: IteratorPrototypeThrowPass,
  [Symbol.toStringTag]: 'TBD',
}, Iterator.asyncPrototype);

Iterator.asyncPrototype.take = function take(n) {
  const limit = ES.ToNumber(n);
  const iterated = GetIteratorDirect(this, 'async');
  const iterator = ES.ObjectCreate(AsyncIteratorPrototypeTakeIteratorPrototype, [
    // 'Limit',
    // 'AsyncTaken',
    // 'Iterated',
  ]);
  iterator.Limit = limit;
  iterator.AsyncTaken = 0;
  iterator.Iterated = iterated;
  return iterator;
};

Iterator.asyncPrototype.reduce = async function reduce(reducer, start) {
  if (ES.IsCallable(reducer) === false) {
    throw new TypeError();
  }
  const iterated = GetIteratorDirect(this, 'async');
  let final = start;
  while (true) {
    const next = await ES.IteratorNext(iterated);
    const done = ES.IteratorComplete(next);
    if (done === true) {
      await ES.AsyncIteratorClose(iterated, () => undefined);
      return final;
    }
    const value = ES.IteratorValue(next);
    final = await ES.Call(reducer, undefined, [final, value]);
  }
};

Iterator.asyncPrototype.toArray = async function toArray() {
  const iterated = GetIteratorDirect(this, 'async');
  const array = [];
  while (true) {
    const next = await ES.IteratorNext(iterated);
    const done = ES.IteratorComplete(next);
    if (done === true) {
      await ES.AsyncIteratorClose(iterated, () => undefined);
      return array;
    }
    const value = ES.IteratorValue(next);
    array.push(value);
  }
};
