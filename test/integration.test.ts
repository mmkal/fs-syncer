import * as fs from 'fs'
import * as lodash from 'lodash'
import * as path from 'path'
import {describe, test, expect} from 'vitest'
import * as fsSyncer from '../src'

test('dedents by default', () => {
  const syncer = fsSyncer.testFixture({
    expect,
    targetState: {
      'foo.js': `
        export const foo = () => {
          if (Math.random() > 0.5) {
            console.log('foo')
          }
        }
      `,
    },
  })

  syncer.sync()

  expect(syncer.yaml()).toMatchInlineSnapshot(`
    "---
    foo.js: |-
      export const foo = () => {
        if (Math.random() > 0.5) {
          console.log('foo')
        }
      }
    "
  `)
})

test('adds newline by default', () => {
  const syncer = fsSyncer.testFixture({
    expect,
    targetState: {
      'test.txt': `abc`,
    },
  })

  syncer.sync()

  expect(syncer.read()['test.txt']).toMatch(/^abc\r?\n$/)
})

test('dedent can be disabled using mergeStrategy', () => {
  const syncer = fsSyncer.testFixture({
    expect,
    mergeStrategy: params => params.targetContent,
    targetState: {
      'foo.js': `
        export const foo = () => {
          if (Math.random() > 0.5) {
            console.log('foo')
          }
        }
      `,
    },
  })

  syncer.sync()

  expect(syncer.yaml()).toMatchInlineSnapshot(`
    "---
    foo.js: |-

              export const foo = () => {
                if (Math.random() > 0.5) {
                  console.log('foo')
                }
              }
    "
  `)
})

test('custom merge strategy', () => {
  const syncer = fsSyncer.testFixture({
    expect,
    mergeStrategy: params => {
      if (params.filepath.includes('.vscode') && params.filepath.endsWith('.json')) {
        // IRL, you may want to use a parser which can handle comments in json
        const existingConfig = JSON.parse(params.existingContent || '{}')
        const defaultConfig = JSON.parse(params.targetContent || '{}')

        const mergedConfig = lodash.defaultsDeep(existingConfig, defaultConfig)

        return JSON.stringify(mergedConfig, null, 2)
      }

      return fsSyncer.defaultMergeStrategy(params)
    },
    targetState: {
      '.vscode': {
        'settings.json': `
          {
            "custom.tool.settings": {
              "teamSetting1": "default value 1",
              "teamSetting2": "default value 2",
              "teamSetting3": "default value 3"
            }
          }
        `,
      },
    },
  })

  const settingsPath = path.join(syncer.baseDir, '.vscode/settings.json')
  fs.mkdirSync(path.dirname(settingsPath), {recursive: true})
  fs.writeFileSync(
    settingsPath,
    JSON.stringify({
      'custom.tool.settings': {
        userSetting: 'xyz',
        teamSetting2: 'default value overidden by user',
      },
    }),
    'utf8',
  )

  syncer.sync()

  expect(syncer.yaml()).toMatchInlineSnapshot(`
    "---
    .vscode: 
      settings.json: |-
        {
          "custom.tool.settings": {
            "userSetting": "xyz",
            "teamSetting2": "default value overidden by user",
            "teamSetting1": "default value 1",
            "teamSetting3": "default value 3"
          }
        }"
  `)
})

describe('ignore paths', () => {
  const setup = () =>
    fsSyncer.testFixture({
      expect,
      targetState: {
        excluded: {
          'a.txt': 'aaa',
        },
        nested: {
          'b.txt': 'bbb',
          excluded: {
            'c.txt': 'ccc',
          },
        },
        included: {
          'd.txt': 'ddd',
          alsoincluded: {
            'e.txt': 'eee',
          },
        },
        src: {
          'foo.js': `console.log('foo')`,
          nestedjs: {
            'bar.js': `console.log('bar')`,
          },
        },
      },
    })

  test('ignore paths', () => {
    setup().sync()

    const ignoreExcludedDirs = fsSyncer.testFixture({expect, targetState: {}, exclude: ['excluded']})

    expect(ignoreExcludedDirs.yaml()).toMatchInlineSnapshot(`
      "---
      included: 
        d.txt: |-
          ddd

        alsoincluded: 
          e.txt: |-
            eee

      nested: 
        b.txt: |-
          bbb

      src: 
        foo.js: |-
          console.log('foo')

        nestedjs: 
          bar.js: |-
            console.log('bar')
      "
    `)
  })

  test('can whitelist folders', () => {
    setup().sync()

    const ignoreExcludedDirs = fsSyncer.testFixture({expect, targetState: {}, exclude: [/^((?!src).)*$/]})

    expect(ignoreExcludedDirs.yaml()).toMatchInlineSnapshot(`
      "---
      src: 
        foo.js: |-
          console.log('foo')

        nestedjs: 
          bar.js: |-
            console.log('bar')
      "
    `)
  })
})
