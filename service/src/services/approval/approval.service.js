// Initializes the `approval` service on path `/approval`
const createService = require('feathers-rethinkdb');
const hooks = require('./approval.hooks');
const filters = require('./approval.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'approval',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/approval', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('approval');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
