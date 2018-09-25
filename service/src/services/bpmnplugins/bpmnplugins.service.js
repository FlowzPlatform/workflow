// Initializes the `bpmnplugins` service on path `/bpmnplugins`
const createService = require('feathers-rethinkdb');
const hooks = require('./bpmnplugins.hooks');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'bpmnplugins',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/bpmnplugins', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('bpmnplugins');

  service.hooks(hooks);
};
