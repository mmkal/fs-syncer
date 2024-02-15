import {createFSSyncer} from '.'
import * as path from 'path'
import {type CreateSyncerParams} from './types'

export interface JestExpectLike {
  getState: () => {currentTestName: string; testPath: string}
}

type TestFixtureParams = Omit<CreateSyncerParams<any>, 'baseDir'> & {
  expect: JestExpectLike
}

/**
 * @experimental
 * Call from a jest test to setup a syncer in a `baseDir` based on the current file, suite and test name.
 * This reduces the risk of copy-paste errors resulting in two tests trying to write to the same directory.
 * @param targetState target file tree
 */
// todo: give this the same signature as createFsSyncer
export const testFixture = ({expect, ...params}: TestFixtureParams) => {
  return createFSSyncer<any>({
    baseDir: baseDir(expect),
    ...params,
  })
}

/** @deprecated use `testFixture` and pass in expect manually */
export const jestFixture = (params: Omit<TestFixtureParams, 'expect'>) =>
  testFixture({expect: (global as any).expect, ...params})

export const baseDir = (expect: JestExpectLike) =>
  path.join(
    path.dirname(expect.getState().testPath),
    'fixtures',
    path.basename(expect.getState().testPath),
    expect
      .getState()
      .currentTestName.toLowerCase()
      .replaceAll(/[^\da-z]/g, '-') // convert everything non-alphanumeric to dashes
      .replaceAll(/-+/g, '-') // remove double-dashes
      .replace(/^-*/, '') // remove dashes at the start
      .replace(/-*$/, ''), // remove dashes at the end
  )

export const wipe = (expect: JestExpectLike) =>
  createFSSyncer({
    baseDir: path.join(path.dirname(expect.getState().testPath), 'fixtures'),
    targetState: {},
  }).sync()
