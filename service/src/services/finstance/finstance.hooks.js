const errors = require('@feathersjs/errors');
// let async = require('asyncawait/async');
// let await = require('asyncawait/await');
let _ = require('lodash');


module.exports = {
  before: {
    all: [],
    find: [
      hook => beforeFind(hook)
    ],
    get: [],
    create: [
      hook => beforeCreate(hook)
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};


function beforeFind (hook) {
  // console.log('hook', hook.params)
}

function beforeCreate (hook) {
  hook.params.query.$select = ['json'];
  hook.data.createdAt = new Date().toISOString();
  // const query = Object.assign({}, hook.params.query);
  // console.log('___________________________________________________________________________')
  // console.log('hook.params.userPackageDetails', hook.params)
  // console.log('___________________________________________________________________________')
  if (hook.data.fid) {
    // hook.params.headers = hook.params.headers
    return hook.app.service('flowz').get(hook.data.fid, hook.params).then(res => {
      // console.log('res++++++++++++++++++++++++++++++', res)
      let startObj = _.find(res.json.processList, {"type": "start"});
      let nextTargetObj = getNextTarget(res.json.processList, startObj.target[0].id);
      hook.data.currentStatus = nextTargetObj.id;
      hook.data.mainStatus = 'inprocess';
      hook.data.stageReference = [];
      return hook;
    }).catch(err => {
      console.log('err', err)
      throw new errors.BadRequest('Error', {
        errors: { message: err.toString() }
      });
    })
  }
};

function getNextTarget (processList, targetId) {
  let targetObj = _.find(processList,{"id": targetId})
  if (targetObj.type === 'start' || targetObj.type === 'endevent' || targetObj.type === 'intermediatethrowevent') {
    return targetObj;
  }
  if(targetObj.inputProperty.length === 0) {
    targetObj = getNextTarget(instanceId, targetObj.target[0].id)
  }
  return targetObj;
};