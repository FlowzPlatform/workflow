// Initializes the `settings` service on path `/settings`
const createService = require('./settings.class.js');
const hooks = require('./settings.hooks');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'settings',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/settings', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('settings');

  service.hooks(hooks);
};
