const rethinkdbdash = require('rethinkdbdash');
const config2 = require('config');
module.exports = function() {
  const app = this;
  const config = require('./services/config');
  const r = rethinkdbdash(config.rethinkdb);
  const oldSetup = app.setup;
  app.set('rdb_host', config2.get("rdb_host"));
  app.set('rdb_port', config2.get("rdb_port"));
  app.set('rdb_db', config2.get("rdb_db"));
  app.set('rethinkdbClient', r);
  // const config = app.get('rethinkdb');
  // const r = rethinkdbdash(config);
  // const oldSetup = app.setup;
  // app.set('rethinkdbClient', r);
  app.setup = function(...args) {
    let promise = Promise.resolve();
    // Go through all services and call the RethinkDB `init`
    // which creates the database and tables if they do not exist
    Object.keys(app.services).forEach(path => {
      const service = app.service(path);
      if (typeof service.init === 'function') {
        promise = promise.then(() => service.init());
      }
    });
    // Access the initialization if you want to run queries
    // right away that depend on the database and tables being created
    this.set('rethinkInit', promise);
    promise.then(() => oldSetup.apply(this, args));
    return this;
  };
};