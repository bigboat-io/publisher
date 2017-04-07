const assert  = require('assert');
const env     = require('../src/env.js');

describe('Env', () => {
  it('should return the environment value when set', () => {
    process.env['someenv'] = 'somevalue'
    assert.equal(env.get('someenv', 'defaultval'), 'somevalue');
  });
});
