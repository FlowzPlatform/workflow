const Queue = require('rethinkdb-job-queue')
const daex = require('json-daex')
const func = require('./function')
const app = require('config')
const config = app.rethinkdb
const cxnOptions = app.rethinkdb
var pino = require('pino')
var rdash = require('rethinkdbdash')(config)
var fs = require('fs')
var axios = require('axios')
var _ = require('lodash')
const qOptions = {
  name: 'approval_worker',
  masterInterval: 10000,
  changeFeed: true,
  concurrency: 100,
  removeFinishedJobs: false
}
var approval_log = []
var approvalClass = {}
var input = []
const q = new Queue(cxnOptions, qOptions)
q.process(async(job, next) => {
  input = job.data.input
  try {
    for (let i = 0; i < job.data.capacity; i++) {
      job.data.output[i] = {}
      for (key in job.data.input[i]) {
        job.data.output[i][key] = job.data.input[i][key]
      }
    }
    let emailTemplate, emailTemplateUrl, emailTemplateHtml
    let approvar = []
    await axios({
        method: 'get',
        url: 'http://localhost:3030/flowz-instance/' + job.data.fId,
      })
      .then(function(response) {
        for (let i = 0; i < response.data.processList.length; i++) {
          if (response.data.processList[i].id == job.data.jobId) {
            approvalClass = response.data.processList[i].properties[0].approvalClass
            emailTemplate = response.data.processList[i].properties[0].emailTemplate
            for (let m = 0; m < approvalClass.process.length; m++) {
              let check = _.find(response.data.approval_log, { 'id': approvalClass.process[m].id })
              approval_log = response.data.approval_log
              if (check == undefined) {
                approvar.push({ 'aId': approvalClass.process[m].id, 'mailTo': approvalClass.process[m].email, 'role': approvalClass.process[m].role })
              }
            }
            for (let k = 0; k < response.data.processList[i].properties.length; k++) {
              for (let j = 0; j < response.data.processList[i].properties[k].entityschema.emailTemplate.length; j++) {
                if (emailTemplate == response.data.processList[i].properties[k].entityschema.emailTemplate[j].filename) {
                  emailTemplateUrl = response.data.processList[i].properties[k].entityschema.emailTemplate[j].url
                }
              }
            }
          }
        }
      })
    await axios({
        method: 'get',
        url: emailTemplateUrl
      })
      .then(function(response) {
        emailTemplateHtml = response.data
      })
    let data = _.head(approvar)
    if (data != undefined) {
      let submitLink = 'http://localhost:8000/mail/reply/' + job.data.jobId + '/' + job.data.fId + '/' + data.aId
      let myData = {
        "to": data.mailTo,
        "subject": "From " + data.role,
        "body": emailTemplateHtml + '<br><button><a href="' + submitLink + '" style="text-decoration:none; color:#000">Submit</a></button>'
      }
      await axios.post('http://ec2-54-88-11-110.compute-1.amazonaws.com/api/login', app.credential)
        .then(function(response) {
          axios({
              method: 'post',
              url: app.sendEmail,
              data: myData,
              headers: {
                'authorization': response.data.logintoken
              }
            })
            .then(function(response) {
              console.log('Mail Sent..!')
            })
        })
    }
    await job.update()
    return next(null, 'success')
  } catch (err) {
    pino().error(new Error('... error in process'))
    return next(new Error('error'))
  }
})
q.on('terminated', (queueId, jobId) => {
  q.getJob(jobId).then((job) => {
    func.processError(job[0].data)
    pino().info({ 'jobId': job[0].data.id }, 'Approval Type Job terminated');
    pino(fs.createWriteStream('./mylog')).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'Approval Type Job terminated')
  }).catch(err => {
    pino().error(new Error(err));
    pino(fs.createWriteStream('./mylog')).error({ "error": err }, 'Error in Approval Type Job terminated')
  })
})
q.on('completed', (queueId, jobId, isRepeating) => {
  q.getJob(jobId).then(async(job) => {
    console.log('job.data', job[0].data)
    let resultData = job[0].data
      // func.processSuccess(job[0].data) //do this after getting final approval from end user
    let approval = 0
    let instanceTable = app.flowz_table
    let instanceList = await rdash.table(instanceTable).get(job[0].data.fId).run()
    let processlog = _.find(instanceList.process_log, { 'job': job[0].data.jobId })
    for (let m = 0; m < approvalClass.process.length; m++) {
      let check = _.find(approval_log, { 'id': approvalClass.process[m].id })
      if (check != undefined) {
        approval++
      }
    }
    if (approval == approvalClass.process.length) {
      console.log('=====================')
      if (_.isArray(input)) {
        for (let arr in processlog.input) {}
      } else {
        var newObject = _.reduce(input, function(result, value, key) {
          if (!_.has(processlog.input[0], key)) {
            result[key] = value;
          }
          return result
        }, {});
        console.log('newObject', newObject)
        console.log('--->', resultData)
        const Queue = require('rethinkdb-job-queue')
          //--------------- Connection Options -----------------
        const cxnOptions = config
          //--------------- Queue Options -----------------
        const qOptions = {
          name: app.scheduler_table
        }
        const q = new Queue(cxnOptions, qOptions)
        var jobOptions = {}
        jobOptions.data = {}
          // jobOptions.data.fId = id
        jobOptions.data = {
          "fId": resultData.fId,
          "input": newObject,
          "isExternalInput": true,
          "jobId": resultData.jobId,
        }
        jobOptions.timeout = app.qJobTimeout
        jobOptions.retryMax = app.qJobRetryMax
        console.log('jobOptions', jobOptions)
          //--------------- Create new job -----------------
        const job = q.createJob(jobOptions)
          //--------------- Add job -----------------
        q.addJob(job).then((savedJobs) => {}).catch(err => console.error(err))
      }
    }
    pino().info({ 'jobId': job[0].data.id }, 'Approval Type Job completed:')
    pino(fs.createWriteStream('./mylog')).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'Approval Type Job completed:')
  }).catch(err => {
    pino().error(new Error(err));
    pino(fs.createWriteStream('./mylog')).error({ "error": err }, 'Error in Approval Type Job compleated')
  })
})