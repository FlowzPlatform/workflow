/* eslint-disable no-unused-vars */

const createServiceMain = require('feathers-rethinkdb');

class Service {
  constructor (options) {
    this.options = options || {};
    this.service = new createServiceMain(options);
    this.rDB = this.service.options.r.db(this.service.options.db);
  }

  setup(app) {
    this.app = app;
    // this.service.watchChangefeeds(app);
    this.on('created',(data) => {
      this.app.io.emit(this.service.options.name+'_created', data);
    });
    this.on('updated',(data) => {
      this.app.io.emit(this.service.options.name+'_updated', data);
    });
    this.on('patched',(data) => {
      this.app.io.emit(this.service.options.name+'_updated', data);
    });
    this.on('removed',(data) => {
      this.app.io.emit(this.service.options.name+'_removed', data);
    });
  }
  setTableName (params) {
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
