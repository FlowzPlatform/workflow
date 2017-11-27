let async = require('asyncawait/async');
let await = require('asyncawait/await');
const app = require('config');
const config = app.get('rethinkdb')
const _ = require('lodash')
const axios = require('axios')
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
    patch: [
      hook => updateProcesslogforMappingRequired(hook)
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
var updateProcesslogforMappingRequired = async(function(hook) {
  console.log('------------------ update --------------');
  // console.log('updatedHook', hook.result);
  for (let [key, m] of hook.result.processList.entries()) {
    m.log = _.chain(hook.result.process_log).filter(f => {
      return f.job === m.id
    }).orderBy(['lastModified'], ['desc']).groupBy('jobId').value()
    await (handleMappingRequireStatus(m, hook.result.id))
  }
})

function getCurrentStatus(log) {
  return (log.length > 0) ? _.head(log).status : ''
}

function getLastLog(logs) {
  return _.head(logs)
}
var handleMappingRequireStatus = async(function(data, fid) {
  // handle mapping required
  if (data.log && _.keys(data.log).length > 0) {
    for (var [key, f] of _.values(data.log).entries()) {
      // var f = data.log[inx]
      //   // var _allProcess = _.forEach(data.log, async(f => {
      if (getCurrentStatus(f).toLowerCase() === 'mappingrequired') {
        let _lastLog = getLastLog(f)
        let dataObject = {
          'fId': fid,
          'input': _lastLog.input[0].inputs,
          'isExternalInput': true,
          'jobId': _lastLog.jobId,
          'job': _lastLog.job
        }
        let uri = 'http://localhost:3030/addInputToJobQue'
        console.log('axios call', _lastLog.jobId)
        await (axios.post(uri, dataObject))
      }
    }
    // }))
    // console.log('_allProcess', _allProcess)
    // return Promise.all([])
  }
})

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