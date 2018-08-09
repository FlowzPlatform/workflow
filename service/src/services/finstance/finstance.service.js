// Initializes the `finstance` service on path `/finstance`
const createService = require('feathers-rethinkdb');
const hooks = require('./finstance.hooks');
const filters = require('./finstance.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'finstance',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/finstance', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('finstance');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
