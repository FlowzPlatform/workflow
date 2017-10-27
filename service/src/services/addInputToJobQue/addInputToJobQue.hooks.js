let async = require('asyncawait/async');
let await = require('asyncawait/await');
const app = require('config');
const config = app.get('rethinkdb')
const rdash = require('rethinkdbdash')(config)
const _ = require('lodash')
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
      hook => aftercreateInstance(hook)
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

function beforeCreate(hook) {
  const Queue = require('rethinkdb-job-queue')
  const cxnOptions = config
  const qOptions = {
    name: app.get('import')
  }
  const q = new Queue(cxnOptions, qOptions)
  var jobOptions = {}
  jobOptions.data = {}
    // jobOptions.data.fId = id
  jobOptions.data = hook.data
  jobOptions.timeout = app.get('qJobTimeout')
  jobOptions.retryMax = app.get('qJobRetryMax')
  const job = q.createJob(jobOptions)
  q.addJob(job).then((savedJobs) => {}).catch(err => console.error(err))
  hook.result = { "data": hook.data, code: 200 }
}