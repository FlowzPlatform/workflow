const Queue = require('rethinkdb-job-queue')
const daex = require('json-daex')
const func = require('./function')
const app = require('./config')
const { mjml2html } = require('mjml')
const config = app.rethinkdb
const cxnOptions = app.rethinkdb
var pino = require('pino')
var rdash = require('rethinkdbdash')(config)
var fs = require('fs')
var axios = require('axios')
var _ = require('lodash')
var $ = require('jquery')
const qOptions = {
  name: 'approvalClass',
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
    let emailTemplate, emailTemplateUrl, emailTemplateHtml, runningProcess, processLog
    let approvar = []
    let rolesEmail = []
    await axios({
        method: 'get',
        url: 'http://localhost:3030/flowz-instance/' + job.data.fId
      })
      .then(async function(response) {
        runningProcess = _.find(response.data.processList, ['id', job.data.job])
        processLog = response.data.process_log
        emailTemplate = runningProcess.inputProperty[0].entityschema.emailTemplate
        let processRoles = runningProcess.inputProperty[0].approvalClass.items[0].role

        await axios({
          method: 'get',
          url: 'http://172.16.160.32:3000/userslist/' + processRoles
        })
        .then(async function(res) {
          rolesEmail = await res.data.data.roles
        })
        emailTemplateUrl = _.find(runningProcess.inputProperty[0].entityschema.emailTemplate, ['filename', runningProcess.inputProperty[0].emailTemplate])
        emailTemplateUrl = emailTemplateUrl.url
      })
    await axios({
        method: 'get',
        url: emailTemplateUrl
      })
      .then(function(response) {
        emailTemplateHtml = response.data
        processLog = _.chain(processLog).orderBy(['lastModified'], ['asc']).findLast((f) => { return f.jobId === job.data.jobId }).value()
        for(var i = 0; i < runningProcess.inputProperty[0].entityschema.entity.length; i++) {
          let element = runningProcess.inputProperty[0].entityschema.entity[i].name
          element = element.toLowerCase()
          let index = emailTemplateHtml.search('"' + element + '"')
          element = _.capitalize(element)
          emailTemplateHtml = emailTemplateHtml.substr(0, index + element.length + 3) + processLog.input[0][element] + emailTemplateHtml.substr(index + element.length + 3)
        }
        emailTemplateHtml = mjml2html(emailTemplateHtml)
      })
      .catch(function(error) {
        console.log('Error : ', error)
      })
    // console.log('rolesEmail', rolesEmail)
    if (rolesEmail.length > 0) {
      for(var j = 0; j < rolesEmail.length; j++)
      {
        let submitLink = 'http://localhost:8000/mail/reply/' + rolesEmail[j] + '/' + job.data.job + '/' + job.data.jobId + '/' + job.data.fId
        let myData = {
          "to": rolesEmail[j],
          "subject": "From " + rolesEmail[j],
          "body": emailTemplateHtml.html + '<br><button><a href="' + submitLink + '" style="text-decoration:none; color:#000">Submit</a></button>'
        }
        await axios({
          method: 'post',
          url: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api/login', 
          data: app.credential
        })
        .then(async function(response) {
          await axios({
              method: 'post',
              url: app.sendEmail,
              data: myData,
              headers: {
                'authorization': response.data.logintoken
              }
            })
            .then(function(response) {
              console.log('Mail Sent to ' + rolesEmail[j])
            })
            .catch(function(error) {
              console.log('Error : ', error)
            })
        })
      }  
    }
    await job.update()
    return next(null, 'success')
  } catch (err) {
    pino().error('... error in process',err)
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
    // let resultData = job[0].data
    // let approval = 0
    // let instanceTable = app.flowz_table
    // let instanceList = await rdash.table(instanceTable).get(job[0].data.fId).run()
    // let processlog = _.find(instanceList.process_log, { 'job': job[0].data.jobId })
    // for (let m = 0; m < approvalClass.process.length; m++) {
    //   let check = _.find(approval_log, { 'id': approvalClass.process[m].id })
    //   if (check != undefined) {
    //     approval++
    //   }
    // }
    // if (approval == approvalClass.process.length) {
    //   console.log('=====================')
    //   if (_.isArray(input)) {
    //     for (let arr in processlog.input) {}
    //   } else {
    //     var newObject = _.reduce(input, function(result, value, key) {
    //       if (!_.has(processlog.input[0], key)) {
    //         result[key] = value;
    //       }
    //       return result
    //     }, {});
    //     console.log('newObject', newObject)
    //     console.log('--->', resultData)
    //     const Queue = require('rethinkdb-job-queue')
    //       //--------------- Connection Options -----------------
    //     const cxnOptions = config
    //       //--------------- Queue Options -----------------
    //     const qOptions = {
    //       name: app.scheduler_table
    //     }
    //     const q = new Queue(cxnOptions, qOptions)
    //     var jobOptions = {}
    //     jobOptions.data = {}
    //       // jobOptions.data.fId = id
    //     jobOptions.data = {
    //       "fId": resultData.fId,
    //       "input": newObject,
    //       "isExternalInput": true,
    //       "jobId": resultData.jobId,
    //     }
    //     jobOptions.timeout = app.qJobTimeout
    //     jobOptions.retryMax = app.qJobRetryMax
    //     console.log('jobOptions', jobOptions)
    //       //--------------- Create new job -----------------
    //     const job = q.createJob(jobOptions)
    //       //--------------- Add job -----------------
    //     q.addJob(job).then((savedJobs) => {}).catch(err => console.error(err))
    //   }
    // }
    pino().info({ 'jobId': job[0].data.id }, 'Approval Type Job completed')
    pino(fs.createWriteStream('./mylog')).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'Approval Type Job completed')
  }).catch(err => {
    pino().error(new Error(err));
    pino(fs.createWriteStream('./mylog')).error({ "error": err }, 'Error in Approval Type Job compleated')
  })
})