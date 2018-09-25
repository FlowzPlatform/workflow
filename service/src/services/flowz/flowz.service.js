// Initializes the `emailtemplate` service on path `/emailtemplate`
const createService = require('feathers-rethinkdb');
const hooks = require('./flowz.hooks');
module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');
  const options = {
    name: 'flowz',
    Model,
    paginate
  };
  // Initialize our service with any options it requires
  app.use('/flowz', createService(options));
  // Get our initialized service so that we can register hooks and filters
  const service = app.service('flowz');
  service.hooks(hooks);
  service.hooks({
    before: {
      find(context) {
        if (context.params.query.$useremail) {
          let useremail = context.params.query.$useremail;
          delete context.params.query.$useremail;
          const query = this.createQuery(context.params.query);
          context.params.rethinkdb = query.filter((row) => {
            return row('allowedusers').setIntersection(
              [useremail]
            ).count().ge(1);
          });
        }
      }
    }
  });
};
