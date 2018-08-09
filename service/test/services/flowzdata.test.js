const assert = require('assert');
const app = require('../../src/app');

describe('\'flowzdata\' service', () => {
  it('registered the service', () => {
    const service = app.service('flowzdata');

    assert.ok(service, 'Registered the service');
  });
});
