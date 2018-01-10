class Syntax extends Map {
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
}
