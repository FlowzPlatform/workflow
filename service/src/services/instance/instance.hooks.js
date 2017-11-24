let async = require('asyncawait/async');
let await = require('asyncawait/await');
let axios = require('axios')
const app = require('config');
const config = app.get('rethinkdb')
const rdash = require('rethinkdbdash')(config)
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
  for (var element in hook.result) {
    let object = await (getinstancevalue(hook.result[element].refid))
    outputObject.push(object);
  }
  console.log('hook.data.processid', hook.data.processid)
  console.log('hook.data.instanceid', hook.data.instanceid)
  let flowinstace = await (axios.get('http://localhost:3030/flowz-instance/' + hook.data.instanceid))
  let process = _.find(flowinstace.data.processList, function(o) { return o.id == hook.data.processid; });
  console.log('process', process)
  if (process != undefined) {
    if (process.inputProperty[0].approvalClass !== undefined) {
      addtoApprovalClass(hook.data.instanceid, outputObject, hook.data.processid)
    } else {
      AddValueToJobQue(hook.data.instanceid, outputObject, hook.data.processid)
    }
  } else {
    AddValueToJobQue(hook.data.instanceid, outputObject, hook.data.processid)
  }
  // AddValueToJobQue(hook.data.instanceid, outputObject, hook.data.processid)
});
var addtoApprovalClass = async(function(instanceid, inputdata, processid) {
  console.log('approval class', inputdata)
  const Queue = require('rethinkdb-job-queue')
    //--------------- Connection Options -----------------
  const cxnOptions = config
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
    "jobId": processid,
  }
  jobOptions.timeout = app.get('qJobTimeout')
  jobOptions.retryMax = app.get('qJobRetryMax')
  console.log('jobOptions', jobOptions)
    //--------------- Create new job -----------------
  const job = q.createJob(jobOptions)
    //--------------- Add job -----------------
  q.addJob(job).then((savedJobs) => {}).catch(err => console.error(err))
  axios.get('http://localhost:3030/flowz-instance/' + instanceid)
    .then(response => {
      let log = _.chain(response).orderBy(['lastModified'], ['asc']).findLast((f) => { return f.job === processid }).value()
      console.log('=====1=1=1=1=1=1=1=1====>', log)
      log.status = 'sendForApproval'
      console.log('-1->', _.find(response.process_log, log))
      axios.put('http://localhost:3030/flowz-instance/' + instanceid, response)
        .then(res => {
          console.log(res)
        })
        .catch(error => {
          console.log('Error : ', error)
        })
    })
})
var getinstancevalue = async(function(id) {
  var response = await (axios.get('http://localhost:3030/instance/' + id))
    // console.log('response', response)
  return response.data
});

function AddValueToJobQue(flowid, data, processid) {
  const Queue = require('rethinkdb-job-queue')
  const cxnOptions = config
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
    "jobId": processid,
  }
  jobOptions.timeout = app.get('qJobTimeout')
  jobOptions.retryMax = app.get('qJobRetryMax')
  const job = q.createJob(jobOptions)
  q.addJob(job).then((savedJobs) => {}).catch(err => console.error(err))
}