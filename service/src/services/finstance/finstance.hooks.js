const errors = require('@feathersjs/errors');
const uuidv4 = require('uuid/v4');
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
      hook => beforePatch(hook)
    ],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      hook => afterCreate(hook)
    ],
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

function beforePatch (hook) {
  if (hook.data.hasOwnProperty('stageReference')) {
    hook.data.modifiedAt = new Date().toISOString();
  }
}
// let fdataid = ''
function beforeCreate (hook) {
  // console.log('Hook: ', hook)
  hook.params.data = hook.data.data
  delete hook.data.data
  hook.data.claimUser = ''
  hook.data.mainStatus = 'inprocess'

  fdataid = uuidv4()
  hook.params.data.id = fdataid

  let stageDataObj = {
    stageRecordId: fdataid,
    StageName: hook.data.currentStatus,
    createdAt: new Date().toISOString()
  }

  // hook.data.stageReference = [stageDataObj]
  hook.data.stageReference = []

  hook.data.createdAt = new Date().toISOString();
  hook.data.modifiedAt = hook.data.createdAt
  // if (hook.data.fid) {
  //   return hook.app.service('flowz').get(hook.data.fid, hook.params).then(res => {
  //     if (res.startId.length > 0) {
  //       let startObj = getStartObject(res.startId, res.processList)
  //       if (startObj !== 0) {
  //         // let nextTargetObj = getNextTarget(res.processList, startObj.target[0].id);
  //         let nextTargetObj = res.processList[startObj.target[0].id];
  //         // console.log('nextTargetObj', nextTargetObj)
  //         hook.data.currentStatus = nextTargetObj.id;
  //         hook.data.mainStatus = 'inprocess';
  //         hook.data.stageReference = [];
  //         hook.data.stageReference.push(stageDataObj);
  //         return hook;
  //       } else {
  //         throw new errors.BadRequest('Error', {
  //           errors: { message: err.toString() }
  //         });
  //       }
  //     } else {
  //       throw new errors.BadRequest('Error', {
  //         errors: { message: err.toString() }
  //       });
  //     }
  //   }).catch(err => {
  //     console.log('err', err)
  //     throw new errors.BadRequest('Error', {
  //       errors: { message: err.toString() }
  //     });
  //   })
  // }
};

function afterCreate (hook) {
  // console.log('&&&&&&&&&&&&&&&&&&&&&&Hook.data.result: ', hook.result)
  if (hook.params.hasOwnProperty('data')) {
    let id = hook.params.data.id
    delete hook.params.data.id   
    console.log('^^^^^^^^^^^^^^^^^^^^^: ', hook.params)
    // console.log("hook.app.service('flowzdata'", hook.app.service('flowzdata').create({abc:'xyz'}))
    return hook.app.service('flowzdata').create({
      id: id,
      data: hook.params.data,
      iid: hook.result.id,
      fid: hook.result.fid,
      state: hook.data.currentStatus
    }, hook.params).then(res => {
      return hook
    }).catch(err => {
      console.log('err', err)
      throw new errors.BadRequest('Error', {
        errors: { message: err.toString() }
      });
    })
  }
  
}

function getStartObject (startStates, processList) {
  for (let item of startStates) {
    if (processList[item].target.length > 0) {
      return processList[item]
    }
  }
  return 0
}
