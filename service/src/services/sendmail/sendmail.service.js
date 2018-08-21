// Initializes the `sendmail` service on path `/sendmail`
const createService = require('./sendmail.class.js');
const hooks = require('./sendmail.hooks');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'sendmail',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/sendmail', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('sendmail');

  service.hooks(hooks);
};
