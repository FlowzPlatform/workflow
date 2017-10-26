const assert = require('assert');
const app = require('../../src/app');

describe('\'schema\' service', () => {
  it('registered the service', () => {
    const service = app.service('schema');

    assert.ok(service, 'Registered the service');
  });
});
