module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      hook => blockUpdate(hook)
    ],
    update: [
      hook => blockUpdate(hook)
    ],
    patch: [
      hook => blockUpdate(hook)
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

function blockUpdate(hook) {
  hook.result = hook.data
}
