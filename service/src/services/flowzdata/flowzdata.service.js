// Initializes the `flowzdata` service on path `/flowzdata`
const createService = require('feathers-rethinkdb');
const hooks = require('./flowzdata.hooks');
const filters = require('./flowzdata.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'flowzdata',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/flowzdata', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('flowzdata');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
