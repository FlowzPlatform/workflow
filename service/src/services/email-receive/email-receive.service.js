// Initializes the `email-receive` service on path `/email-receive`
// const createService = require('./email-receive.class.js');
// const hooks = require('./email-receive.hooks');

// module.exports = function (app) {
//   // const app = this;
//   const paginate = app.get('paginate');

//   const options = {
//     paginate,
//     app
//   };

//   const serviceObj = createService(options);
//   // Initialize our service with any options it requires
//   app.use('/email-receive', serviceObj);

//   app.use('/email-receive/:finstanceId/:taskid', {
//     find (data, params) {
//       // do complex stuff here
//       return serviceObj.updateStatus(data.route, params);
//     }
//   });
//   // Get our initialized service so that we can register hooks
//   const service = app.service('email-receive');

//   service.hooks(hooks);
// };
const createService = require('./email-receive.class.js');
const hooks = require('./email-receive.hooks');

const createDflowzData = require('../dflowzdata/dflowzdata.class.js');
const hooksDflowzData = require('../dflowzdata/dflowzdata.hooks');


module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const Model = app.get('rethinkdbClient');

  const options = {
    name: 'email-receive',
    paginate,
    app
  };

  const serviceObj = createService(options);
  // Initialize our service with any options it requires
  app.use('/email-receive', createService(options));

  app.use('/email-receive/:finstanceId/:taskid', {
    find (data, params) {
      // do complex stuff here
      return serviceObj.updateStatus(data, params);
    }
  });

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('email-receive');

  service.hooks(hooks);

  const options1 = {
    name: 'dflowzdataInt',
    Model,
    paginate,
    app
  };
  // Initialize our service with any options it requires
  app.use('/dflowzdataInt', createDflowzData(options1));
  // Get our initialized service so that we can register hooks and filters
  const service1 = app.service('dflowzdataInt');
  service1.hooks(hooksDflowzData);
};
