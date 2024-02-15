import * as fs from 'fs'
import * as path from 'path'
import {describe, test, expect} from 'vitest'
import * as fsSyncer from '../src'
import {wipe} from '../src/testing'

test('fixture dir is created', () => {
  const fixture = fsSyncer.testFixture({
    expect,
    targetState: {'one.txt': 'uno'},
  })

  fixture.sync()

  expect(fs.existsSync(path.join(__dirname, 'fixtures', 'testing.test.ts', 'fixture-dir-is-created'))).toBe(true)
  expect(
    fs
      .readFileSync(path.join(__dirname, 'fixtures', 'testing.test.ts', 'fixture-dir-is-created', 'one.txt'))
      .toString()
      .trim(),
  ).toBe('uno')
})

test('wipe() deletes existing files', () => {
  const before = fsSyncer.testFixture({
    expect,
    targetState: {'one.txt': '1'},
  })

  before.sync()

  expect(fs.readdirSync(path.join(__dirname, 'fixtures', 'testing.test.ts', 'wipe-deletes-existing-files'))).toEqual([
    'one.txt',
  ])

  wipe(expect)

  expect(fs.readdirSync(path.join(__dirname, 'fixtures', 'testing.test.ts', 'wipe-deletes-existing-files'))).toEqual([])
})

describe('A suite', () => {
  test(`another test (doesn't have nice path formatting!)`, () => {
    const fixture = fsSyncer.testFixture({
      expect,
      targetState: {'two.txt': 'dos'},
    })

    fixture.sync()

    expect(
      fs.existsSync(
        path.join(__dirname, 'fixtures', 'testing.test.ts', 'a-suite-another-test-doesn-t-have-nice-path-formatting'),
      ),
    ).toBe(true)
    expect(
      fs
        .readFileSync(
          path.join(
            __dirname,
            'fixtures',
            'testing.test.ts',
            'a-suite-another-test-doesn-t-have-nice-path-formatting',
            'two.txt',
          ),
        )
        .toString()
        .trim(),
    ).toBe('dos')
  })
})

test('yaml snapshot', () => {
  const fixture = fsSyncer.testFixture({
    expect,
    targetState: {
      'singleline.js': `console.log('hello world')`,
      'multiline.py':
        `if __name__ == "__main__":\n` + // prettier-break
        `  print("hello world")`,
      nested: {
        directory: {
          'withfile.txt': 'hello world',
          with: {
            'multiline.rs':
              `fn main() {\n` + // prettier-break
              `  println!("hello world");\n` +
              `}`,
          },
        },
      },
    },
  })

  fixture.sync()

  expect(fixture.yaml()).toMatchInlineSnapshot(`
    "---
    multiline.py: |-
      if __name__ == "__main__":
        print("hello world")

    singleline.js: |-
      console.log('hello world')

    nested: 
      directory: 
        withfile.txt: |-
          hello world

        with: 
          multiline.rs: |-
            fn main() {
              println!("hello world");
            }
    "
  `)
})
