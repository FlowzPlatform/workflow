/* eslint-disable no-unused-vars */

const createServiceMain = require('feathers-rethinkdb');

class Service {
  constructor (options) {
    this.options = options || {};
    this.events = ['_created','_updated','_patched','_removed'];
    this.service = new createServiceMain(options);
    this.rDB = this.service.options.r.db(this.service.options.db);
  }

  setup(app) {
    this.app = app;
    this.app.service('dflowzdata').removeAllListeners('created');
    this.app.service('dflowzdata').removeAllListeners('updated');
    this.app.service('dflowzdata').removeAllListeners('removed');
    this.app.service('dflowzdata').removeAllListeners('patched');

    // this.service.watchChangefeeds(app);
    this.on('created',(data) => {
      this.app.service('dflowzdata').emit('_created',{[this.service.options.name]:data});
    });
    this.on('updated',(data) => {
      this.app.service('dflowzdata').emit('_updated', {[this.service.options.name]:data});
    });
    this.on('patched',(data) => {
      this.app.service('dflowzdata').emit('_patched', {[this.service.options.name]:data});
    });
    this.on('removed',(data) => {
      this.app.service('dflowzdata').emit('_removed', {[this.service.options.name]:data});
    });
  }
  setTableName (params) {
    params.headers.ftablename = params.headers.ftablename.replace(/-/g, '_');
    this.service.options.name = params.headers.ftablename;
    this.service.table = this.rDB.table(params.headers.ftablename);
  }

  find (params) {
    this.setTableName(params);
    return this.service.find(params);
  }

  get (id, params) {
    this.setTableName(params);
    return this.service.get(id, params);
  }

  create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }
    this.setTableName(params);
    return this.service.create(data, params);
  }

  update (id, data, params) {
    this.setTableName(params);
    return this.service.update(id, data, params);
  }

  patch (id, data, params) {
    this.setTableName(params);
    return this.service.patch(id, data, params);
  }

  remove (id, params) {
    this.setTableName(params);
    return this.service.remove(id, params);
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
