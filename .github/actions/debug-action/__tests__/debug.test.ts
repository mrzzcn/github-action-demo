import * as core from '@actions/core'
const fakeGithub = {
  context: {
    payload: {
      pusher: {
        name: 'mono',
      },
    },
  },
}

jest.setMock('@actions/github', fakeGithub)
import fs from 'fs'
import yaml from 'js-yaml'
import run from '../debug'

beforeEach(() => {
  jest.resetModules()
  const doc = yaml.safeLoad(fs.readFileSync(__dirname + '/../action.yml', 'utf8'))
  Object.keys(doc.inputs).forEach((name) => {
    const envVar = `INPUT_${name.replace(/ /g, '_').toUpperCase()}`
    process.env[envVar] = doc.inputs[name]['default']
  })
})

afterEach(() => {
  const doc = yaml.safeLoad(fs.readFileSync(__dirname + '/../action.yml', 'utf8'))

  Object.keys(doc.inputs).forEach((name) => {
    const envVar = `INPUT_${name.replace(/ /g, '_').toUpperCase()}`
    delete process.env[envVar]
  })
})

describe('debug action debug messages', () => {
  it('outputs a debug message', async () => {
    const debugMock = jest.spyOn(core, 'debug')
    await run()
    expect(debugMock).toHaveBeenCalledWith(
      `👋 Hello ${fakeGithub.context.payload.pusher.name}! You are an amazing ${process.env['INPUT_AMAZING-CREATURE']}! 🙌`,
    )
  })

  it('does not output debug messages for non-amazing creatures', async () => {
    process.env['INPUT_AMAZING-CREATURE'] = 'mosquito'
    const debugMock = jest.spyOn(core, 'debug')
    const setFailedMock = jest.spyOn(core, 'setFailed')
    await run()
    expect(debugMock).toHaveBeenCalledTimes(0)
    expect(setFailedMock).toHaveBeenCalledWith('Sorry, mosquitos are not amazing 🚫🦟')
  })
})

describe('debug action output', () => {
  it('sets the action output', async () => {
    const setOutputMock = jest.spyOn(core, 'setOutput')
    await run()
    expect(setOutputMock).toHaveBeenCalledWith(
      'amazing-message',
      `👋 Hello ${fakeGithub.context.payload.pusher.name}! You are an amazing ${
        process.env[`INPUT_AMAZING-CREATURE`]
      }! 🙌`,
    )
  })
})
