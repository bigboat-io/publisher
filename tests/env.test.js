const assert  = require('assert')
const td      = require('testdouble')
const env     = require('../src/env.js')

describe('Env', () => {
  describe('get', () => {
    it('should return the environment value when set', () => {
      process.env['someenv'] = 'somevalue'
      assert.equal(env.get('someenv', 'defaultval'), 'somevalue')
    })
    it('should return the default value when the environment variable is not set', () => {
      assert.equal(env.get('env-not-set123', 'mydefault'), 'mydefault')
    })
  })
  describe('assert', () => {
    it('should return the environment variable when set', () => {
      const process = td.object({env: {someenv: 'somevalue'}, exit: () => {}})
      const console = td.object({error: () => {}})
      assert.equal(env._assert(process, console, 'someenv'), 'somevalue')
    })
  })
})
