// Initializes the `emailtemplate` service on path `/emailtemplate`
const createService = require('feathers-rethinkdb');
const hooks = require('./instance-test.hooks');
const filters = require('./instance-test.filters');
module.exports = function() {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');
  const options = {
    name: 'instancetest',
    Model,
    paginate
  };
  // Initialize our service with any options it requires
  app.use('/instance-test', createService(options));
  // Get our initialized service so that we can register hooks and filters
  const service = app.service('instance-test');
  service.hooks(hooks);
  if (service.filter) {
    service.filter(filters);
  }
};