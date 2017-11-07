// Initializes the `emailtemplate` service on path `/emailtemplate`
const createService = require('feathers-rethinkdb');
const hooks = require('./plugin.hooks');
const filters = require('./plugin.filters');
module.exports = function() {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');
  const options = {
    name: 'plugin',
    Model,
    paginate
  };
  // Initialize our service with any options it requires
  app.use('/plugin', createService(options));
  // Get our initialized service so that we can register hooks and filters
  const service = app.service('plugin');
  service.hooks(hooks);
  if (service.filter) {
    service.filter(filters);
  }
};