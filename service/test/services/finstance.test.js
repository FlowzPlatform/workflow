const assert = require('assert');
const app = require('../../src/app');

describe('\'finstance\' service', () => {
  it('registered the service', () => {
    const service = app.service('finstance');

    assert.ok(service, 'Registered the service');
  });
});
