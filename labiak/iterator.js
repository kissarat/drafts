function range(max, min = 0) {
  const array = []
  for (let i = min; i < max; i++) {
    array.push(i)
  }
  return array
}

class Iterator {
  constructor(array, index = -1) {
    this.array = array
    this.index = index
  }

  next() {
    this.index++
    return this
  }

  get value() {
    return this.array[this.index]
  }

  get done() {
    return this.index < this.array.length
  }

  at(i = 0) {
    return this.array[this.index + i]
  }
}

class Iterable extends Array {

}

Iterable.prototype[Symbol.iterator] = function () {
  return new Iterator(this)
}

function generator(array, start = -1) {
  function counter(control = 1) {
    if (isFinite(control)) {
      counter.index += control
    }
    return array[counter.index]
  }

  counter.index = start
  counter.array = array
  counter.can = function (i = 0) {
    return counter.index + i < counter.array.length
  }
  counter.slice = function (start = counter.index) {
    if (start < 0) {
      start += counter.index
    }
    return generator(counter.array, start)
  }
  counter.at = function (i = 0) {
    return counter.array[counter.index + i]
  }
  return counter
}
