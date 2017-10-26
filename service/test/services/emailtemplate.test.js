const assert = require('assert');
const app = require('../../src/app');

describe('\'emailtemplate\' service', () => {
  it('registered the service', () => {
    const service = app.service('emailtemplate');

    assert.ok(service, 'Registered the service');
  });
});
