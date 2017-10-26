// Initializes the `schema` service on path `/schema`
const createService = require('./schema.class.js');
const hooks = require('./schema.hooks');
const filters = require('./schema.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const swagger = require('feathers-swagger');
  

  const options = {
    name: 'schema',
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
  app.use('/schema', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('schema');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
