import * as fs from 'fs'
import {Volume} from 'memfs'
import {test, expect} from 'vitest'
import {createFSSyncer} from '../src'

test('can use memfs', () => {
  const vol = Volume.fromJSON({'/tmp/root.txt': 'root'})
  const syncer = createFSSyncer({
    baseDir: '/tmp/this/should/not/be/created/on/the/real/filesystem',
    targetState: {'one.txt': '1'},
    fs: vol,
  })

  syncer.sync()

  expect(fs.existsSync(syncer.baseDir)).toBeFalsy()
  expect(vol.toJSON()).toMatchInlineSnapshot(`
    Object {
      "/tmp/root.txt": "root",
      "/tmp/this/should/not/be/created/on/the/real/filesystem/one.txt": "1
    ",
    }
  `)
})
