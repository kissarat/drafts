if ('undefined' !== typeof module) {
  var {Vocabulary} = require('./vocabulary')
}


class SyntaticVocabulary extends Vocabulary {
  define(string = this.constructor.string) {
    this.definition = new BackusNaur()
    for (const definition of this.definition.parse(string)) {
      this.set(definition.first.toString(), definition.second)
    }
  }

  toJSON() {
    const o = {}
    for (const [key, value] of this) {
      console.log(value)
      o[key] = value.toJSON()
    }
    return o
  }

  toString(pretty) {
    const json = this.toJSON()
    return pretty ? JSON.stringify(json, null, '  ') : JSON.stringify(json)
  }
}

if ('undefined' !== typeof module) {
  module.exports = {
    SyntaticVocabulary
  }
}
