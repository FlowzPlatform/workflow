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
    update: [
      hook => beforeUpdate(hook)
    ],
    patch: [
      hook => beforeUpdate(hook)
    ],
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
  console.log('hook.params', hook.params)
  const query = hook.service.createQuery(hook.params.query);
      
  // const searchString = "my search string";
  // console.log('__________________________________________________')
  // console.log('hook.service', hook.app.services.flowzdata.table)
  console.log('__________________________________________________')
  // ----------------------------- || Get Last Record Data || --------------------------
  // hook.params.rethinkdb = query.outerJoin(hook.app.services.flowzdata.table ,function(instance,data){
  //   return instance.hasFields('stageReference').and(
  //     instance('stageReference').count().gt(0).and(
  //     data('id').eq(instance('stageReference').nth(-1).getField('stageRecordId'))
  //   ))
  // }).without({"right": {"id": true}})
  // .zip()

  // ----------------------------- || Get Last Record Data || --------------------------
  // hook.params.rethinkdb = query.hasFields('stageReference').filter(function(mdoc) {
  //   return mdoc("stageReference").count().gt(0)
  // }).map(function(item) {
  //   return item.merge({
  //     'stageReference': item('stageReference').map(function(doc1) {
  //       return doc1.merge(function(doc) {
  //         // return {data: doc1.getField('stageRecordId')}
  //         // return {data: r.db('FlowzEngine').table('flowzdata').get(doc1.getField('stageRecordId')).getField('data')}
  //         return {data: hook.app.services.flowzdata.table.get(doc1.getField('stageRecordId')).getField('data')}
  //       })
  //     })   
  //   })
  // })
  console.log('__________________________________________________')
  // console.log('hook.params.rethinkdb', hook.params.rethinkdb)
}

function beforeUpdate (hook) {
  hook.data.modifiedAt = new Date().toISOString();
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
      // console.log('nextTargetObj', nextTargetObj)
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
  // if (targetObj.type === 'start' || targetObj.type === 'endevent' || targetObj.type === 'intermediatethrowevent') {
  //   return targetObj;
  // }
  // if(targetObj.inputProperty.length === 0) {
  // targetObj = getNextTarget(processList, targetObj.target[0].id)
  // }
  return targetObj;
};
