const errors = require('@feathersjs/errors');
const uuidv4 = require('uuid/v4');

module.exports = {
  before: {
    all: [],
    find: [],
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

function beforeCreate (hook) {
  try {
    // console.log('before create ================================', hook.data, hook.params)
    hook.params.done = true
    if (hook.params.headers.ftablename !== undefined && hook.data._state !== undefined) {
      let regex = /_/g
      let tName = hook.params.headers.ftablename.replace(regex, '-')
      return hook.app.service('flowz').get(tName).then(res => {
        hook.data._currentStatus = true
        hook.data._createdAt = new Date().toISOString()
        // hook.data._userId = ''
        // hook.data._claimUser = ''
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
  // console.log('afterCreate ================================', hook.data)
  // If first state found add another entry with nexttarget
  if (hook.params.done && hook.params.first !== undefined) {
    hook.data._state = hook.data._nextTarget
    hook.data._nextTarget = ''
    // hook.data._createdAt = new Date().toISOString()
    hook.data._previous = hook.result.id
    delete hook.params.first
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', hook.data)
    return hook.app.service('dflowzdata').create(hook.data, hook.params).then(res => {
      return hook;
    }).catch(err => {
      console.log('err', err)
      throw new errors.BadRequest('Error', {
        errors: { message: err.toString() }
      });
    })
  } else {
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', hook.datas)
    hook.params.headers.normalPatch = true
    return hook.app.service('dflowzdata').patch(hook.data._previous, {
      // _state: hook.data._state,
      _next: hook.result.id,
      _completedAt: new Date().toISOString()
      // _currentStatus: false
    }, hook.params).then(resp => {
      return hook
    })
  }
}

function beforePatch (hook) {
  // console.log('beforePatch =============================', hook.data, '>>>>>>>>>>>>>>>>>>>>', hook.id)
  hook.params.done1 = true
  if (hook.params.headers.ftablename !== undefined) {
      if (hook.params.headers.normalPatch !== undefined) {
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
  // console.log('================================ afterPatch', hook.data, hook.id)
  if (hook.params.headers.normalPatch !== undefined) {
    // console.log('.....................................')
  } else {
    if (hook.params.done1) {
      return hook.app.service('dflowzdata').get(hook.id, hook.params).then(resp => {
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
        return hook.app.service('dflowzdata').create(hook.data, hook.params).then(res => {
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