// Initializes the `emailtemplate` service on path `/emailtemplate`
const createService = require('feathers-rethinkdb');
const hooks = require('./emailtemplate.hooks');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'emailtemplate',
    Model,
    paginate
  };
  // Initialize our service with any options it requires
  app.use('/emailtemplate', createService(options));
  // Get our initialized service so that we can register hooks and filters
  const service = app.service('emailtemplate');
  service.hooks(hooks);
};
