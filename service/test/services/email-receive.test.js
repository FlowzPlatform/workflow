const assert = require('assert');
const app = require('../../src/app');

describe('\'email-receive\' service', () => {
  it('registered the service', () => {
    const service = app.service('email-receive');

    assert.ok(service, 'Registered the service');
  });
});
