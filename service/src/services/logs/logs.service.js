// Initializes the `emailtemplate` service on path `/emailtemplate`
const createService = require('feathers-rethinkdb');
const hooks = require('./logs.hooks');
const filters = require('./logs.filters');
module.exports = function() {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');
  const options = {
    name: app.get('system_logs_table'),
    Model,
    paginate
  };
  // Initialize our service with any options it requires
  app.use('/logs', createService(options));
  // Get our initialized service so that we can register hooks and filters
  const service = app.service('logs');
  service.hooks(hooks);
  if (service.filter) {
    service.filter(filters);
  }
};
