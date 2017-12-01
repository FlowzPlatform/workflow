let async = require('asyncawait/async');
let await = require('asyncawait/await');
let axios = require('axios')
const app = require('config');
var serverUrl = 'http://' + app.host + ':' + app.port + '/'
const config = require('../config')
const _ = require('lodash')
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
var aftercreateInstance = async(function(hook) {
  let outputObject = [];
  // console.log('hook.result', hook.result)
  let flowinstace = await (axios.get(serverUrl + 'flowz-instance/' + hook.data.instanceid))
  let process = _.find(flowinstace.data.processList, function(o) { return o.id == hook.data.processid; });
  for (var element in hook.result) {
    let object = await (getinstancevalue(hook.result[element].refid, process.inputProperty[0].entityschema._id))
    outputObject.push(object);
  }
  // console.log('hook.data.processid', hook.data.processid)
  // console.log('hook.data.instanceid', hook.data.instanceid)
  // console.log('process', process.inputProperty[0].entityschema._id)
  if (process != undefined) {
    if (process.inputProperty[0].approvalClass !== undefined) {
      addtoApprovalClass(hook.data.instanceid, outputObject, hook.data.processid, hook.data.jobId)
    } else {
      AddValueToJobQue(hook.data.instanceid, outputObject, hook.data.processid, hook.data.jobId)
    }
  } else {
    AddValueToJobQue(hook.data.instanceid, outputObject, hook.data.processid, hook.data.jobId)
  }
  // AddValueToJobQue(hook.data.instanceid, outputObject, hook.data.processid)
});
var addtoApprovalClass = async(function(instanceid, inputdata, processid, jobId) {
  const Queue = require('rethinkdb-job-queue')
    //--------------- Connection Options -----------------
  const cxnOptions = config.rethinkdb
    //--------------- Queue Options -----------------
  const qOptions = {
    name: app.get('approvar_table')
  }
  const q = new Queue(cxnOptions, qOptions)
  var jobOptions = {}
  jobOptions.data = {}
    // jobOptions.data.fId = id
  jobOptions.data = {
    "fId": instanceid,
    "input": inputdata,
    "isExternalInput": true,
    "job": processid,
    "jobId": jobId
  }
  jobOptions.timeout = app.get('qJobTimeout')
  jobOptions.retryMax = app.get('qJobRetryMax')
    //--------------- Create new job -----------------
  const job = q.createJob(jobOptions)
    //--------------- Add job -----------------
  q.addJob(job).then((savedJobs) => {}).catch(err => console.error(err))
  axios.get(serverUrl + 'flowz-instance/' + instanceid)
    .then(response => {
      let log = _.chain(response.data.process_log).orderBy(['lastModified'], ['asc']).findLast((f) => { return f.jobId === jobId }).clone().value()
      log.status = 'sendForApproval'
      log.lastModified = new Date()
      response.data.process_log.push(log)
      axios.put(serverUrl + 'flowz-instance/' + instanceid, response.data)
        .then(res => {
          console.log('Status updated for approval : sendForApproval')
        })
        .catch(error => {
          console.log('Error : ', error)
        })
    })
})
var getinstancevalue = async(function(id, schemaid) {
  var response = await (axios.get(serverUrl + 'instance/' + id + '?schemaid=' + schemaid))
    // console.log('response', response)
  return response.data
});

function AddValueToJobQue(flowid, data, processid, jobId) {
  const Queue = require('rethinkdb-job-queue')
  const cxnOptions = config.rethinkdb
  const qOptions = {
    name: app.get('scheduler_table')
  }
  const q = new Queue(cxnOptions, qOptions)
  var jobOptions = {}
  jobOptions.data = {}
  jobOptions.data = {
    "fId": flowid,
    "input": data,
    "isExternalInput": true,
    "job": processid,
    "jobId": jobId
  }
  console.log('jobOptions', jobOptions)
  jobOptions.timeout = app.get('qJobTimeout')
  jobOptions.retryMax = app.get('qJobRetryMax')
  const job = q.createJob(jobOptions)
  q.addJob(job).then((savedJobs) => {}).catch(err => console.error(err))
}