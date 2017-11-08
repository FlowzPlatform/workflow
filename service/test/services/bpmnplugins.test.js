const assert = require('assert');
const app = require('../../src/app');

describe('\'bpmnplugins\' service', () => {
  it('registered the service', () => {
    const service = app.service('bpmnplugins');

    assert.ok(service, 'Registered the service');
  });
});
