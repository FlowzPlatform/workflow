const app = require('config');
const config = app.get('rethinkdb')
module.exports = {
  before: {
    all: [],
    find: [],
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

function aftercreateInstance(hook) {
  let id = hook.data.id;
  // console.log('hook.data.id', hook.data)
  if (hook.data.id != undefined) {
    const Queue = require('rethinkdb-job-queue')
      //--------------- Connection Options -----------------
    const cxnOptions = config
      //--------------- Queue Options -----------------
    const qOptions = {
      name: app.get('scheduler_table')
    }
    const q = new Queue(cxnOptions, qOptions)
    var jobOptions = {}
    jobOptions.data = {}
    jobOptions.data.fId = id
    jobOptions.timeout = app.get('qJobTimeout')
    jobOptions.retryMax = app.get('qJobRetryMax')
      //--------------- Create new job -----------------
    const job = q.createJob(jobOptions)
      //--------------- Add job -----------------
    q.addJob(job).then((savedJobs) => {}).catch(err => console.error('Hook Errors', err))
  }
}