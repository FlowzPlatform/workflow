// // Initializes the `dataquery` service on path `/dataquery`
// const createService = require('./dataquery.class.js');
// const hooks = require('./dataquery.hooks');
// const filters = require('./dataquery.filters');

// module.exports = function () {
//   const app = this;
//   const paginate = app.get('paginate');

//   const options = {
//     name: 'dataquery',
//     paginate
//   };

//   // Initialize our service with any options it requires
//   app.use('/dataquery', createService(options));

//   // Get our initialized service so that we can register hooks and filters
//   const service = app.service('dataquery');

//   service.hooks(hooks);

//   if (service.filter) {
//     service.filter(filters);
//   }
// };

// Initializes the `databases` service on path `/databases`
const createService = require('feathers-rethinkdb');
const hooks = require('./dataquery.hooks');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'dataquery',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/dataquery', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('dataquery');

  service.hooks(hooks);
};
