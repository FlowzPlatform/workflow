let async = require('asyncawait/async');
let await = require('asyncawait/await');
let axios = require('axios')
const app = require('config');
const config = app.get('rethinkdb')
const rdash = require('rethinkdbdash')(config)
// const _ = require('lodash')
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
  let instanceid = hook.data.data[0].refid;
  console.log('instanceid', hook.data.data[0].refid);
  axios.get('http://localhost:3030/instance/' + instanceid)
    .then(function(response) {
      console.log('response', response.data);
      AddValueToJobQue(hook.data.instanceid, response.data, hook.data.processid)      
    })
    .catch(function(error) {
      console.log(error);
    });
});

function AddValueToJobQue(flowid, data, processid){
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