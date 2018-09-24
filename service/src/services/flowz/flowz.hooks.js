module.exports = {
  before: {
    all: [],
    find: [
      hook => beforeFind(hook)
    ],
    get: [
      hook => beforeGet(hook)
    ],
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
  if (hook.params.query && hook.params.query.$paginate) {
    hook.params.paginate = hook.params.query.$paginate === 'false' || hook.params.query.$paginate === false;
    delete hook.params.query.$paginate;
  }
}

let beforeGet = function (hook) {
  // console.log('-------------------------------------------------------------------')
  // console.log('hook.params.headers', hook.params)
  // console.log('-------------------------------------------------------------------')
}