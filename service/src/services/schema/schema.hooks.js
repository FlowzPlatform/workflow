

module.exports = {
  before: {
    all: [],
    find: [
      hook => beforeFind(hook)
    ],
    get: [],
    create: [],
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


let beforeFind = function(hook) {
  const query = hook.params.query
  if (query.isdeleted != undefined) {
    if (hook.params.query.isdeleted == 'true') {
      hook.params.query.isdeleted = true
    } else if (hook.params.query.isdeleted == 'false') {
      hook.params.query.isdeleted = false
    }
  }
}