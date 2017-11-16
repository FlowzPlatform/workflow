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
  AddValueToJobQue(hook.data.instanceid, outputObject, hook.data.processid)
});
var getinstancevalue = async(function(id) {
  var response = await (axios.get('http://localhost:3030/instance/' + id))
    // console.log('response', response)
  return response.data
});

function AddValueToJobQue(flowid, data, processid) {
  console.log('data', data)
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
  console.log('jobOptions.data', jobOptions.data)
  jobOptions.timeout = app.get('qJobTimeout')
  jobOptions.retryMax = app.get('qJobRetryMax')
  const job = q.createJob(jobOptions)
  q.addJob(job).then((savedJobs) => {}).catch(err => console.error(err))
}