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


let beforeFind = function (hook) {
  const query = hook.params.query
  if (query.isdeleted != undefined) {
    if (hook.params.query.isdeleted == 'true') {
      hook.params.query.isdeleted = true
    } else if (hook.params.query.isdeleted == 'false') {
      hook.params.query.isdeleted = false
    }
  }
  // if (hook.params.query && hook.params.query.isdeleted) {
  //   hook.params.query.isdeleted = !!hook.params.query.isdeleted;
  // }

  if (hook.params.query && hook.params.query.$paginate) {
    hook.params.paginate = hook.params.query.$paginate === 'false' || hook.params.query.$paginate === false;
    delete hook.params.query.$paginate;
  }
}

let beforeCreate = function (hook) {
  hook.data.createdAt = new Date().toISOString()
}