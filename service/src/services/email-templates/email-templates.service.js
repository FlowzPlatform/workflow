// Initializes the `email-templates` service on path `/email-templates`
const createService = require('feathers-rethinkdb');
const hooks = require('./email-templates.hooks');
const filters = require('./email-templates.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'email_templates',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/email-templates', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('email-templates');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
