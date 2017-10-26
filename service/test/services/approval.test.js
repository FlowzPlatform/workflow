const assert = require('assert');
const app = require('../../src/app');

describe('\'approval\' service', () => {
  it('registered the service', () => {
    const service = app.service('approval');

    assert.ok(service, 'Registered the service');
  });
});
