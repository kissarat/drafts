class Iterator {
  constructor(array, index = -1) {
    this.array = array
    this.index = index
  }

  next() {
    return this.array[this.index++]
  }

  slice(index = 0) {
    return new Iterator(this.array, index)
  }

  at(n) {
    return this.array[this.index + n]
  }

  shift(n = 1) {
    this.index += n
    return !this.done
  }

  get current() {
    return this.array[this.index]
  }

  set current(v) {
    this.array[this.index] = v
  }

  get done() {
    return this.index >= this.array.length
  }
}
