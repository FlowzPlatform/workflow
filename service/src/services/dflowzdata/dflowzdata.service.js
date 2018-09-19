// Initializes the `sendmail` service on path `/sendmail`
const createService = require('./dflowzdata.class.js');
const hooks = require('./dflowzdata.hooks');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const Model = app.get('rethinkdbClient');

  const options = {
    name: 'dflowzdata',
    paginate,
    Model
  };

  // Initialize our service with any options it requires
  app.use('/dflowzdata', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('dflowzdata');

  service.hooks(hooks);
  // console.log('=======',Object.keys(app.services),'=========');
};
