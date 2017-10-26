const assert = require('assert');
const app = require('../../src/app');

describe('\'instance\' service', () => {
  it('registered the service', () => {
    const service = app.service('instance');

    assert.ok(service, 'Registered the service');
  });
});
