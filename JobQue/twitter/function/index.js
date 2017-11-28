const Queue = require('rethinkdb-job-queue')
const app = require('../config')
const cxnOptions = app.rethinkdb
const SCHEDULER_TABLE = app.qOptions.name
const FLOWZ_TABLE = app.flowz_table
const rdash = require('rethinkdbdash')(cxnOptions)
const TIMEOUT = 60000 * 60
var pino = require('pino')
var fs = require('fs')
async function notifyScheduler(fId, output, input, currentProcess, processType, instanceCount, forProcess) {
  await checkConnection(false, 100)
    //--------------- Queue Options -----------------
  const qOptions = {
    name: SCHEDULER_TABLE
  }
  const q = new Queue(cxnOptions, qOptions)
  var jobOptions = {}
  jobOptions.data = {}
  jobOptions.data.fId = fId
  jobOptions.data.type = processType.toLowerCase()
  jobOptions.data.isNewInstance = false
  jobOptions.data.output = output
  jobOptions.data.currentProcess = currentProcess
  jobOptions.data.instanceCount = instanceCount
  jobOptions.data.input = input
  jobOptions.data.forProcess = forProcess
  jobOptions.data.processNotification = true
  jobOptions.timeout = TIMEOUT
  jobOptions.retryMax = 0
    //--------------- Create new job -----------------
  const job = q.createJob(jobOptions)
    //--------------- Add job -----------------
  q.addJob(job).then((savedJobs) => {}).catch(err => console.error(err))
}
async function updateFlowInstance(newStatus, fId, forProcess, parentStatus, next, current, output, instanceCount, logAt) {
  await checkConnection(false, 20000)
    // console.log('\x1b[33m%s\x1b[0m','... trying to update flow instance')
  let tmp = await rdash.table(FLOWZ_TABLE).filter({ id: fId }).update({ 'processList': rdash.row('processList').changeAt(forProcess, rdash.row('processList')(forProcess).merge({ 'instanceCount': instanceCount })), 'process_log': rdash.row('process_log').changeAt(logAt, rdash.row('process_log')(logAt).merge({ 'inputWait': false, 'output': output, 'status': parentStatus, 'lastModified': new Date() })) }).run()
  pino().info('process in flow instance updated')
}
async function checkConnection(crash, delay) {
  var r = require('rethinkdb')
  r.connect({
    db: cxnOptions.db
  }, function(err, conn) {
    if (err) {
      pino().error('\x1b[31m%s\x1b[0m', '... rethinkdb error')
      setTimeout(function() {
        pino().info('\x1b[33m%s\x1b[0m', '... retrying connection')
        checkConnection(true, delay)
      }, 5000)
    } else {
      if (crash) {
        setTimeout(function() {}, delay)
      }
    }
  })
}
async function processSuccess(job) {
  notifyScheduler(job.fId, job.output, job.input, job.id, job.type, job.instanceCount, job.forProcess)
  let next = ((job.target.length == 0) && (job.type == 'ENDPROCESS')) ? 'completed' : job.target
  await updateFlowInstance('completed', job.fId, job.forProcess, 'completed', next, job.name, job.output, job.instanceCount, job.log_position)
}
async function processError(job) {
  await updateFlowInstance('terminated', job.fId, job.forProcess, 'failed', job.targetid, job.name, job.output, job.instanceCount, job.log_position)
}
module.exports.processError = processError
module.exports.processSuccess = processSuccess
module.exports.checkConnection = checkConnection