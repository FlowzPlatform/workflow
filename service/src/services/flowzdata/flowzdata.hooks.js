const errors = require('@feathersjs/errors');
let _ = require('lodash');

module.exports = {
  before: {
    all: [],
    find: [],
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

function beforeCreate (hook) {
  console.log('_______________________________________________________________: ')
  console.log('Hook: ', hook)
  console.log('_______________________________________________________________: ')

  hook.data.createdAt = new Date().toISOString();
  hook.params.isdone = true;
  if (hook.data.hasOwnProperty('nextTarget')) {
    hook.params.nextTarget = hook.data.nextTarget;
    delete hook.data.nextTarget;
  }
}

function afterCreate (hook) {
  if (hook.params.hasOwnProperty('isdone') && hook.params.isdone) {
    hook.params.query = {};
    // hook.params.query.$select = ['json'];
    const query = Object.assign({}, hook.params.query);
    // console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    // console.log('hook.params', hook.params)
    // console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    return hook.app.service('flowz').get(hook.data.fid, {query}).then(res => {
      // let cuurentObj = _.find(res.json.processList, {id: hook.data.state});
      let cuurentObj = res.processList[hook.data.state];
      console.log('________________________________________________cuurentObj', cuurentObj)
      // let nextTargetObj = getNextTarget(res.json.processList, cuurentObj.target[0].id);
      let nextTargetObj = res.processList[cuurentObj.target[0].id];
      console.log('________________________________________________nextTargetObj', nextTargetObj)
      return hook.app.service('finstance').get(hook.data.iid).then(finstRes => {
        let mdata = {
          currentStatus: nextTargetObj.id,
          stageReference: finstRes.stageReference
        };
        if (hook.params.hasOwnProperty('nextTarget')) {
          mdata.currentStatus = hook.params.nextTarget;
        }
        // if (mdata.stageReference.length > 0) {
        //   // console.log(cuurentObj.id, mdata.stageReference[mdata.stageReference.length - 1].StageName)
        //   // if (mdata.stageReference[mdata.stageReference.length - 1].StageName === cuurentObj.id) {
        //   mdata.stageReference[mdata.stageReference.length - 1].completedAt = new Date().toISOString()
        //   // }
        // }
        console.log('&&&&&&&&&&&&&&&&&&%%%%%%%%%%%%%%%%: ', finstRes)
        let referenceObj = {
          StageName: finstRes.currentStatus,
          stageRecordId: hook.result.id,
          createdAt: finstRes.modifiedAt,
          completedAt: new Date().toISOString(),
          user: {
            id: (hook.params.userPackageDetails !== undefined ? hook.params.userPackageDetails._id: null),
            name: (hook.params.userPackageDetails !== undefined ? hook.params.userPackageDetails.fullname: null),
            email: (hook.params.userPackageDetails !== undefined ? hook.params.userPackageDetails.email: null),
            role: null,
            avatar: (hook.params.userPackageDetails !== undefined ? hook.params.userPackageDetails.picture: null)
          }
        }
        if (hook.params.userPackageDetails !== undefined && hook.params.userPackageDetails.package[hook.params.headers.subscriptionid].role !== undefined) {
          if (typeof hook.params.userPackageDetails.package[hook.params.headers.subscriptionid].role === 'string') {
            referenceObj.user.role = hook.params.userPackageDetails.package[hook.params.headers.subscriptionid].role
          } else {
            referenceObj.user.role = hook.params.userPackageDetails.package[hook.params.headers.subscriptionid].role['workflow_' + hook.data.fid]
          }
        }
        mdata.stageReference.push(referenceObj);
        if (nextTargetObj.type === 'endevent') {
          mdata.mainStatus = 'completed';
        }
        return hook.app.service('finstance').patch(hook.data.iid, mdata).then(pRes => {
          return hook;
        }).catch(err => {
          throw new errors.BadRequest('Error', {
            errors: { message: err.message }
          });
        });
      }).catch(err => {
        throw new errors.BadRequest('Error', {
          errors: { message: err.message }
        });
      });
      return hook;
    }).catch(err => {
      throw new errors.BadRequest('Error', {
        errors: { message: err.message }
      });
    });
  }
}
