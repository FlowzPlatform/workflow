// Initializes the `receive-form` service on path `/receive-form`
const createService = require('./receive-form.class.js');
const hooks = require('./receive-form.hooks');
const filters = require('./receive-form.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const swagger = require('feathers-swagger');
  
  const options = {
    name: 'receive-form',
    paginate
  };

  app.configure(swagger({
      docsPath: '/docs',
      prefix: /api\/v\d\//,
      versionPrefix: /v\d/,
      uiIndex: true,
      info: {
        title: 'A test',
        description: 'A description',
      }
  }))

  // Initialize our service with any options it requires
  app.use('/receive-form', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('receive-form');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
