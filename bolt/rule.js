class Atom extends String {
  get type() {
    return 'atom'
  }
}

class Rule extends Array {
  get type() {
    return this[0]
  }
}
