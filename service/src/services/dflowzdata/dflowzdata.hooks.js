const errors = require('@feathersjs/errors');
const uuidv4 = require('uuid/v4');
const _ = require('lodash')

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
    patch: [
      hook => afterPatch(hook)
    ],
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

let beforeFind = function (hook) {
  const query = hook.params.query
  if (query._currentStatus !== undefined) {
    if (hook.params.query._currentStatus === 'true') {
      hook.params.query._currentStatus = true
    } else if (hook.params.query._currentStatus === 'false') {
      hook.params.query._currentStatus = false
    }
  }
  if (query.$group !== undefined && query.$search !== undefined) {
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    hook.service.service.options.name = hook.params.headers.ftablename;
    hook.service.service.table = hook.service.rDB.table(hook.params.headers.ftablename);
    let value = hook.params.query.$group
    let search = hook.params.query.$search
    delete hook.params.query.$group
    delete hook.params.query.$search
    const query = hook.service.service.createQuery(hook.params.query);
    hook.params.rethinkdb = query.filter(function(doc) {
      return doc.coerceTo('string').match('(?i)' + search);
    }).group(value).ungroup()
    // console.log('hook.params.rethinkdb', hook.params.rethinkdb)
  } else if (query.$group !== undefined) {
    hook.service.service.options.name = hook.params.headers.ftablename;
    hook.service.service.table = hook.service.rDB.table(hook.params.headers.ftablename);
    let value = hook.params.query.$group
    delete hook.params.query.$group
    const query = hook.service.service.createQuery(hook.params.query);
    hook.params.rethinkdb = query.group(value).ungroup()
  } else if (query.$search !== undefined) {
    hook.service.service.options.name = hook.params.headers.ftablename;
    hook.service.service.table = hook.service.rDB.table(hook.params.headers.ftablename);
    let value = hook.params.query.$search
    delete hook.params.query.$search
    const query = hook.service.service.createQuery(hook.params.query);
    // hook.params.rethinkdb = query.group(value)
    hook.params.rethinkdb = query.filter(function(doc) {
      return doc.coerceTo('string').match('(?i)' + value);
    })
  } 
  // else if (query.$subscriptionId !== undefined && query.$userId !== undefined) {

  // }
}

function beforeCreate (hook) {
  try {
    // console.log('before create ================================', hook.params, hook.data)
    hook.params.done = true
    if (hook.params.headers.ftablename !== undefined && hook.data._state !== undefined) {
      let regex = /_/g
      let tName = hook.params.headers.ftablename.replace(regex, '-')
      return hook.app.service('flowz').get(tName).then(res => {
        hook.data._currentStatus = true
        if (res.processList[hook.data._state].type === 'endevent') {
          // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
          hook.data._currentStatus = false
        }
        hook.data._createdAt = new Date().toISOString()
        // hook.data._userId = ''
        hook.data._claimUser = ''
        if (hook.data._state === res.first) {
          if (hook.data._nextTarget === undefined || hook.data._nextTarget === '') {
            hook.data._nextTarget = res.processList[hook.data._state].target[0].id
          }
          hook.params.first = hook.data._state
          // hook.data._completedAt = new Date().toISOString()
          hook.data._currentStatus = false
          hook.data._previous = null
          hook.data._uuid = uuidv4()
          hook.data._next = null
          hook.data._creatorid = (hook.params.userPackageDetails ? hook.params.userPackageDetails._id : '')
        }
        if (res.processList[hook.data._state].type === 'exclusivegateway') {
          // console.log('???????????????????????????????????????????????????')
          let gatewayObj = res.processList[hook.data._state]
          // console.log('gatewayObj', gatewayObj)
          if (gatewayObj['var_name'] !== undefined && gatewayObj['var_name'] !== '' && gatewayObj.condition !== undefined && gatewayObj.condition !== '') {
            if (hook.data.hasOwnProperty(gatewayObj['var_name'])) {
              // console.log('hook.data', hook.data[gatewayObj['var_name']])
              if (gatewayObj.condition == '=') {
                // console.log('')
               let targetIndex = _.findIndex(gatewayObj.target, {label: hook.data[gatewayObj['var_name']]})
               // console.log('targetIndex', targetIndex)
               if (targetIndex !== -1) {
                // console.log('hook.data', hook.data, hook.params)
                // hook.data._previous = 
                hook.params.isEGateway = true
                hook.data._currentStatus = false
                // hook.data._next = null
                // console.log('gatewayObj.target[targetIndex].id', gatewayObj.target[targetIndex].id)
                hook.params.isEGatewayTarget = gatewayObj.target[targetIndex].id
               }
              }
            }
          }
        }
        return hook;
      }).catch(err => {
        console.log('err', err)
        throw new errors.BadRequest('Error', {
          errors: { message: err.toString() }
        });
      })
    } else {
      console.log('either ftablename or _state not found')
      throw new errors.BadRequest('Error', {
        errors: { message: 'BadRequest' }
      });
    }
  } catch (err) {
    console.log('err', err)
    throw new errors.BadRequest('Error', {
      errors: { message: err.toString() }
    });
  }
}


function afterCreate (hook) {
  // If first state found add another entry with nexttarget

  if (hook.params.done) { // to avoid called afterhook multiple times
    // console.log('*********************************************')
    

    if (hook.params.first !== undefined) {
      hook.data._state = hook.data._nextTarget
      hook.data._nextTarget = ''
      hook.data._previous = hook.result.id

      delete hook.params.first
      delete hook.params.isEGateway
      delete hook.data.id

      return hook.app.service(hook.path).create(hook.data, hook.params).then(res => {
        return hook;
      }).catch(err => {
        console.log('err', err)
        throw new errors.BadRequest('Error', {
          errors: { message: err.toString() }
        });
      })
    } else {
      // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', hook.result.id)
      hook.params.headers.normalpatch = true
      // console.log('hook.data._previous', hook.data._previous)
      if (hook.params.isEGateway !== undefined) {
        return hook.app.service(hook.path).patch(hook.data._previous, {
          _next: hook.result.id,
          _completedAt: new Date().toISOString()
        }, hook.params).then(resp => {
          
          hook.data._nextTarget = hook.params.isEGatewayTarget
          // hook.data._previous = hook.result.id
          delete hook.params.first
          delete hook.params.isEGateway
          delete hook.params.isEGatewayTarget
          // delete hook.data.id
          // console.log(':::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::;', hook.data)
          let params = Object.assign({}, hook.params)

          delete params.headers.normalpatch
          
          return hook.app.service(hook.path).patch(hook.result.id, hook.data, params).then(res => {
            // hook.params.headers.normalpatch = true
            // console.log('hook.data._previous', hook.data._previous)
            // return hook.app.service(hook.path).patch(hook.data._previous, {
            //   _next: hook.result.id,
            //   _completedAt: new Date().toISOString()
            // }, hook.params).then(resp => {
            //   return hook
            // })
            return hook;
          }).catch(err => {
            console.log('err', err)
            throw new errors.BadRequest('Error', {
              errors: { message: err.toString() }
            });
          })

          return hook
        })  
      } else {
        return hook.app.service(hook.path).patch(hook.data._previous, {
          _next: hook.result.id,
          _completedAt: new Date().toISOString()
        }, hook.params).then(resp => {
          return hook
        })
      }
      // hook.app.service(hook.path).patch(hook.data._previous, {
      //   _next: hook.result.id,
      //   _completedAt: new Date().toISOString()
      // }, hook.params).then(resp => {
      //   return hook
      // })
      
      // if (hook.params.isEGateway !== undefined) {
      //   // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>..', hook.params, hook.data,  hook.result.id)
      //   // hook.data._state = hook.data._nextTarget
      //   hook.data._nextTarget = hook.params.isEGatewayTarget
      //   // hook.data._previous = hook.result.id
      //   delete hook.params.first
      //   delete hook.params.isEGateway
      //   delete hook.params.isEGatewayTarget
      //   // delete hook.data.id
      //   console.log(':::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::;', hook.data)
      //   delete hook.params.headers.normalpatch
      //   return hook.app.service(hook.path).patch(hook.result.id, hook.data, hook.params).then(res => {
      //     // hook.params.headers.normalpatch = true
      //     // console.log('hook.data._previous', hook.data._previous)
      //     // return hook.app.service(hook.path).patch(hook.data._previous, {
      //     //   _next: hook.result.id,
      //     //   _completedAt: new Date().toISOString()
      //     // }, hook.params).then(resp => {
      //     //   return hook
      //     // })
      //     return hook;
      //   }).catch(err => {
      //     console.log('err', err)
      //     throw new errors.BadRequest('Error', {
      //       errors: { message: err.toString() }
      //     });
      //   })
      // }
    
    }

  }
        

} // end afterCreate function 

function beforePatch (hook) {
  // console.log('beforePatch ============================beforePatch=>>>>>>>>>>>>>>>>>>>>', hook.params, hook.id, hook.data)
  hook.params.done1 = true
  if (hook.params.headers.ftablename !== undefined) {
      if (hook.params.headers.normalpatch !== undefined) {
      } else {
        if (hook.data._state !== undefined) {
          let regex = /_/g
          let tName = hook.params.headers.ftablename.replace(regex, '-')
          return hook.app.service('flowz').get(tName).then(res => {
            if (hook.data._nextTarget === undefined || hook.data._nextTarget === '') {
              hook.data._nextTarget = res.processList[hook.data._state].target[0].id
            }
            hook.data._currentStatus = false
            // hook.data._createdAt = new Date().toISOString()
            // hook.data._userId = ''
            // hook.data._claimUser = ''
            hook.data._completedAt = new Date().toISOString()
            // console.log('before patchOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO', hook.data)
            return hook;
          }).catch(err => {
            console.log('err', err)
            throw new errors.BadRequest('Error', {
              errors: { message: err.toString() }
            });
          })
        } else {
          console.log('_state not found')
          throw new errors.BadRequest('Error', {
            errors: { message: 'BadRequest' }
          });
        }
      }
  } else {
    console.log('ftablename not found')
    throw new errors.BadRequest('Error', {
      errors: { message: 'BadRequest' }
    });
  }

}

function afterPatch (hook) {
  // console.log('================================ afterPatch', hook.id, hook.params.headers.normalpatch)
  if (hook.params.headers.normalpatch !== undefined) {
    // console.log('..................................... ', hook.params.headers.normalpatch)
  } else {
    if (hook.params.done1) {
      // console.log('111111111111111111111111111111111111111111111111111111111111111111', hook.params)
      delete hook.params.done1
      return hook.app.service(hook.path).get(hook.id, hook.params).then(resp => {
        hook.data._state = hook.data._nextTarget
        hook.data._nextTarget = ''
        hook.data._createdAt = new Date().toISOString()
        hook.data._currentStatus = true
        delete hook.data._completedAt
        hook.data._claimUser = ''
        hook.data._userId = ''
        hook.data._previous = hook.id
        hook.data._next = null
        hook.data._uuid = resp._uuid
        delete hook.data.id
        // console.log('???????????????????????????????????????????????????????????????//', hook.data)
        return hook.app.service(hook.path).create(hook.data, hook.params).then(res => {
          return hook;
        }).catch(err => {
          console.log('err', err)
          throw new errors.BadRequest('Error', {
            errors: { message: err.toString() }
          });
        })
      }).catch(err => {
        console.log('err', err)
        throw new errors.BadRequest('Error', {
          errors: { message: err.toString() }
        });
      })
    }
  }
}
