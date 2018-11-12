/* eslint-disable no-unused-vars */
class Service {
  constructor (options) {
    this.options = options || {};
    this.app = this.options['app'];
  }

  setup(app) {
    this.app = app;
  }

  async find (params) {
    return [];
  }

  async get (id, params) {
    let stageId = (new Buffer(id)).toString('base64');
    return {
      id, text: `A new message with ID: ${id}!`,base64:`${stageId}`
    };

  }

  async updateStatus (data, params) {
    let stageId = (new Buffer(data.targetid,'base64')).toString('ascii');
    // data.taskid = stageId
    let id = data.id
    let targetId = stageId
    let currentId = data.stateid
    let flowId = data.flowid
    let headers = {
      ftablename: flowId.replace(/-/g, '_')
    }
    return this.app.service('dflowzdata').get(id, {headers}).then(res => {
      return this.app.service('dflowzdata').get(res._next, {headers}).then(resp => {
        let mdata = resp
        mdata._nextTarget = targetId
        mdata.userId = ''
        // mdata.subscriptionId = ''
        // mdata.subscriptionOwnerId = ''
        
        mdata._currentStatus = false
        return this.app.service('dflowzdataInt').patch(resp.id, mdata, {headers: headers}).then(res => {
          return "Your response saved successfully"
        }).catch(err => {
          throw new Error(err.message)
        })
      }).catch(err => {
        throw new Error(err.message)
      })
    }).catch(e => {
      throw new Error(e.message)
    })
  }

  async create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return {msg:"your response saved"};
  }

  async update (id, data, params) {
    return data;
  }

  async patch (id, data, params) {
    return data;
  }

  async remove (id, params) {
    return { id };
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
