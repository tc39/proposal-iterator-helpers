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

function IteratorOf(...values) {
  return IteratorFrom(values);
}

const Iterator = {
  syncPrototype: IteratorPrototype,
  asyncPrototype: AsyncIteratorPrototype,
  from: IteratorFrom,
  of: IteratorOf,
};

module.exports = Iterator;
global.Iterator = Iterator;

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
    O.Remaining = remaining - 1;
    if (remaining === 0) {
      return ES.CreateIterResultObject(undefined, true);
    }
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

Iterator.syncPrototype.reduce = function reduce(reducer, start) {
  if (ES.IsCallable(reducer) === false) {
    throw new TypeError();
  }
  const iterated = GetIteratorDirect(this);
  let final = start;
  while (true) {
    const next = ES.IteratorStep(iterated);
    if (next === false) {
      ES.IteratorClose(iterated, () => undefined);
      return final;
    }
    const value = ES.IteratorValue(next);
    final = ES.Call(reducer, undefined, [final, value]);
  }
};

Iterator.syncPrototype.collect = function collect() {
  const iterated = GetIteratorDirect(this);
  const array = [];
  while (true) {
    const next = ES.IteratorStep(iterated);
    if (next === false) {
      ES.IteratorClose(iterated, () => undefined);
      return array;
    }
    const value = ES.IteratorValue(next);
    array.push(value);
  }
};

const AsyncIteratorPrototypeMapIteratorPrototype = Object.setPrototypeOf({
  async next(v) {
    const O = this;
    if (ES.Type(O) !== 'Object') {
      throw new TypeError();
    }
    if (!('AsyncMapper' in O && 'Iterated' in O)) {
      throw new TypeError();
    }
    const mapper = O.AsyncMapper;
    const iterated = O.Iterated;
    const next = await ES.IteratorNext(iterated, v);
    const done = ES.IteratorComplete(next);
    if (done === true) {
      await ES.AsyncIteratorClose(iterated, () => undefined);
      return ES.CreateIterResultObject(undefined, true);
    }
    const value = ES.IteratorValue(next);
    const mapped = await ES.Call(mapper, undefined, [value]);
    return ES.CreateIterResultObject(mapped, false);
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
    // 'AsyncMapper',
    // 'Iterated',
  ]);
  iterator.AsyncMapper = mapper;
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

Iterator.asyncPrototype.collect = async function collect() {
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
