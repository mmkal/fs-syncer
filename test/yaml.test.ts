import * as jsYaml from 'js-yaml'
import {test, expect} from 'vitest'
import {yamlishPrinter} from '../src/yaml'

test(`undefined is handled`, () => {
  expect(yamlishPrinter({a: 1, b: undefined, c: null})).toMatchInlineSnapshot(`
    "---
    a: 1
    b: 
    c: "
  `)
})

test.each([
  ['pojo', {a: 1}],
  ['with whitespace', {a: 'aaa bbb cc'}],
  ['with multiline string', {hello: 'aaa\nbbb\nccc'}],
  ['with weird indentation', {a: '  aaaa\nbbb\n  ccc'}],
  ['with null', {a: null}],
  ['with empty string', {a: ''}],
  ['with empty array', {a: []}],
  ['with empty object', {a: {}}],
  ['with nested object', {a: {b: {c: 1, d: {e: null}}, x: 'y'}}],
  ['with nested array', {a: [1, 2, 3]}],
  ['with nested array of objects', {a: [{b: 1}, {c: 2}]}],
] as Array<[string, any]>)('outputs valid yaml for %j', (_name, input) => {
  const output = yamlishPrinter(input)

  expect(jsYaml.load(output), JSON.stringify(output)).toEqual(input)
})
