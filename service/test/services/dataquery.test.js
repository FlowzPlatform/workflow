const assert = require('assert');
const app = require('../../src/app');

describe('\'dataquery\' service', () => {
  it('registered the service', () => {
    const service = app.service('dataquery');

    assert.ok(service, 'Registered the service');
  });
});
