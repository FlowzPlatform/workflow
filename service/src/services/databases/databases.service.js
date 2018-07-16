// Initializes the `databases` service on path `/databases`
const createService = require('feathers-rethinkdb');
const hooks = require('./databases.hooks');
const filters = require('./databases.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'databases',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/databases', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('databases');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
