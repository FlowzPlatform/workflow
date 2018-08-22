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
    let stageId = (new Buffer(data.taskid,'base64')).toString('ascii');
    data.taskid = stageId
    // get Flowz data
    let fInstance = await this.app.service('finstance').get(data.finstanceId);
    // get last Stage submitted data
    let lastIndex = fInstance.stageReference.length - 1
    // get Flowz data
    let flowzData = await this.app.service('flowzdata').get(fInstance.stageReference[lastIndex].stageRecordId);
    
    let flowzDataRecord = await this.app.service('flowzdata').create({
      data: flowzData.data,
      fid: fInstance.fid,
      iid: data.finstanceId,
      state: stageId
    }).catch((err)=> {
      throw new Error(err.message)
    });
    return flowzDataRecord
  }

  async create (data, params) {
    console.log(data, params);
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
