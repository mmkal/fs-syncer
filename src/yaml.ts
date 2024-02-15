/**
 * @experimental Prints an object to yaml, or at least something like it. Not intended to be fully spec-compliant.
 * It's really just used for outputting readable test snapshots.
 */
export const yamlishPrinter = (val: any, tab = '  ') => {
  const buffer: string[] = []
  const printNode = (node: any, indent: number) => {
    if (node === undefined) {
      return
    }

    if (Array.isArray(node)) {
      if (node.length === 0) {
        buffer.push('[]')
        return
      }

      node.forEach(e => {
        buffer.push('\n' + tab.repeat(indent) + '- ')
        printNode(e, indent + 1)
      })
      return
    }

    if (node && typeof node === 'object') {
      const entries = Object.entries(node)
      if (entries.length === 0) {
        buffer.push('{}')
        return
      }

      // .sort((...items) => {
      //   const keys = items.map(e => (e[1] && typeof e[1] === 'object' ? 'z' : typeof e[1]))
      //   return keys[0].localeCompare(keys[1])
      // })
      entries.forEach(e => {
        buffer.push('\n' + tab.repeat(indent) + e[0] + ': ')
        printNode(e[1], indent + 1)
      })
      return
    }

    if (typeof node === 'string' && /\s/.test(node) && /^\S/.test(node)) {
      buffer.push('|-\n')
      node.split('\n').forEach((line, i, arr) => {
        buffer.push(tab.repeat(indent) + line + (i === arr.length - 1 ? '' : '\n'))
      })
      return
    }

    if (typeof node === 'string') {
      buffer.push(JSON.stringify(node?.toString()))
      return
    }

    // eslint-disable-next-line mmkal/@typescript-eslint/no-unsafe-argument
    buffer.push(node?.toString())
  }

  printNode(val, 0)
  return (
    '---\n' +
    buffer
      .join('')
      .split('\n')
      .map(line => (/^\s+$/.test(line) ? '' : line)) // remove lines that are just whitespace
      .join('\n')
      .trimStart()
  )
}
