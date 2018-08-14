const errors = require('feathers-errors');
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
  const query = Object.assign({}, hook.params.query);
  if (hook.data.fid) {
    return hook.app.service('flowz').get(hook.data.fid, {query}).then(res => {
      let startObj = _.find(res.json.processList, {"type": "start"});
      let nextTargetObj = getNextTraget(res.json.processList, startObj.target[0].id);
      hook.data.currentStatus = nextTargetObj.id;
      hook.data.mainStatus = 'inprocess';
      hook.data.stageReference = [];
      return hook;
    }).catch(err => {
      throw new errors.BadRequest('Error', {
        errors: { message: err.toString() }
      });
    })
  }
};

function getNextTraget (processList, targetId) {
  let targetObj = _.find(processList,{"id": targetId})
  if (targetObj.type === 'start' || targetObj.type === 'endevent' || targetObj.type === 'intermediatethrowevent') {
    return targetObj;
  }
  if(targetObj.inputProperty.length === 0) {
    targetObj = getNextTraget(instanceId, targetObj.target[0].id)
  }
  return targetObj;
};