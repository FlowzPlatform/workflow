let async = require('asyncawait/async');
let await = require('asyncawait/await');
const app = require('config');
const config = require('../config')
var serverUrl = 'http://' + app.host + ':' + app.port + '/'
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
var updateProcesslogforMappingRequired = async(function (hook) {
  for (let [key, m] of hook.result.processList.entries()) {
    m['log'] = _.chain(hook.result.process_log).filter(f => {
      return f.job === m.id
    }).sortBy(['lastModified'], ['desc']).reverse().groupBy('jobId').value()
    await (handleMappingRequireStatus(m, hook.result.id))
  }
})

function getCurrentStatus(log) {
  return (log.length > 0) ? _.head(log).status : ''
}

function getLastLog(logs) {
  return _.head(logs)
}
var handleMappingRequireStatus = async(function (data, fid) {
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
        let uri = serverUrl + 'addInputToJobQue'
        await (axios.post(uri, dataObject))
      }
    }
  }
})

function aftercreateInstance(hook) {
  let id = hook.data.id;
  if (hook.data.id != undefined) {
    const Queue = require('rethinkdb-job-queue')
      //--------------- Connection Options -----------------
    const cxnOptions = config.rethinkdb
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
