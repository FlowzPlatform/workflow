

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

let beforeFind = function (hook) {
  const query = hook.params.query
  if (query._currentStatus != undefined) {
    if (hook.params.query._currentStatus == 'true') {
      hook.params.query._currentStatus = true
    } else if (hook.params.query._currentStatus == 'false') {
      hook.params.query._currentStatus = false
    }
  }
}
