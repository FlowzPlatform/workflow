// Initializes the `instance` service on path `/instance`
const createService = require('./instance.class.js');
const hooks = require('./instance.hooks');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'instance',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/instance', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('instance');

  service.hooks(hooks);
};
