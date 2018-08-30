const handler = require('@feathersjs/express/errors');
const notFound = require('feathers-errors/not-found');
const subscription = require('flowz-subscription');
const flowzError = require('flowz-error-handler');

module.exports = function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters
  const app = this; // eslint-disable-line no-unused-vars

  app.use(function(req, res, next) { req.feathers.headers= req.headers; next(); })

  subscription.moduleResource.moduleName = 'workflow';
  let registerAppModule = {
    'flowz': ['create','update', 'patch'],
    'finstance': ['create','update'],
    'flowzdata': ['update', 'patch'],
    'schema': ['create','update', 'patch', 'remove']
  };

  subscription.moduleResource.registerAppModule = registerAppModule;
  subscription.moduleResource.appRoles = ['Superadmin', 'Admin', 'Manager', 'Team-Lead','Client', 'CSR'];
  subscription.registeredAppModulesRole();
  subscription.registerDynamicHooks(app, registerAppModule);

  app.use(flowzError());
  app.use(notFound());
  app.use(handler());
};
