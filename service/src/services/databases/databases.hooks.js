let async = require('asyncawait/async');
let await = require('asyncawait/await');
var endecrypt = require('../encryption/security')
const errors = require('feathers-errors');
let config = require('config');
var axios = require('axios');
var _ = require('lodash');

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
    all: [
      hook => afterFind(hook)
    ],
    find: [],
    get: [
      hook => afterGet(hook)
    ],
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

let beforeCreate = async( function(hook) {
  // console.log('Hook.data', hook.data)
  hook.params.query.selectedDb = hook.data.selectedDb;
  hook.params.query.dbname = hook.data.dbname;
  hook.params.query.username = hook.data.username;
  hook.data.createdAt = new Date();
  if (hook.data.password !== '') {
    hook.params.query.password = endecrypt.encrypt(hook.data.password);
  } else {
    hook.params.query.password = hook.data.password;
  }
  const query = Object.assign({}, hook.params.query);
  return hook.app.service('databases').find({ query }).then(response => {
    if (response.data.length > 0) {
      throw new errors.BadRequest('Connection exist', {
        errors: { message: 'connection already exist with connection name as ' + response.data[0].connection_name }
      });
    } else {
      if (hook.data.isdefault) {
        hook.app.service('databases').find({
          query: {
            $paginate: 'false',
            $select: [ 'id' ]
          }
        }).then(res => {
          for (let item of res) {
            hook.app.service('databases').patch(item.id, {isdefault: false})
          }
        })
      }
      hook.data.password = endecrypt.encrypt(hook.data.password);
    }
    return hook;
  });
})

let beforeFind = function(hook) {
  if (hook.params.query && hook.params.query.$paginate) {
    hook.params.paginate = hook.params.query.$paginate === 'false' || hook.params.query.$paginate === false;
    delete hook.params.query.$paginate;
  }
}

let beforePatch = async(function(hook) {
  // hook.params.query.$paginate = false;
  // const query = Object.assign({}, hook.params.query);
  // return hook.app.service('databases').find({ query }).then(response => {
  //   console.log('response.data', response.data)
  //   for (let mschema of response.data) {
  //     if (mschema.id !== hook.id) {

  //     }
  //   }
  //   return hook;
  // });
  if (hook.data.hasOwnProperty('isdefault') && hook.data.isdefault) {
    hook.app.service('databases').find({
      query: {
        $paginate: 'false',
        $select: [ 'id' ]
      }
    }).then(res => {
      if (res !== undefined && res.length > 0) {
        for (let item of res) {
          if (hook.id !== item.id) {
            hook.app.service('databases').patch(item.id, {isdefault: false})
          }
        }
      }
    })
  }
})

let afterGet = function(hook) {
  if(hook.id) {
    hook.result.password = endecrypt.decrypt(hook.result.password);
  }
}

let afterFind = function(hook) {
  //console.log('afterFind')
  // if(hook.id === undefined) {
  //   hook.result.data = _.map(hook.result.data, (d) => {
  //     return _.omit(d, ['username', 'password'])
  //   })
  // }
}