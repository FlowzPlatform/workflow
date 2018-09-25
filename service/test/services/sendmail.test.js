const assert = require('assert');
const app = require('../../src/app');

describe('\'sendmail\' service', () => {
  it('registered the service', () => {
    const service = app.service('sendmail');

    assert.ok(service, 'Registered the service');
  });
});
