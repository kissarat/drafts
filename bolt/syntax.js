class SyntaticVocabulary extends Vocabulary {
  load(lexemes) {
    const g = generator(lexemes)
    let definition
    while ((definition = parseBackusNaurDefinition(g, GroupRule)) && 'assign' === definition.type) {
      // console.log(definition)
      if ('assign' === definition.type) {
        this.set(definition.first.toString(), definition.second)
      }
      else {
        throw new Error('Unknown definition ' + JSON.stringify(definition))
      }
    }
  }

  toJSON() {
    const o = {}
    for(const [key, value] of this) {
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
