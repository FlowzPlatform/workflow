const Queue = require('rethinkdb-job-queue')
const func = require('./function')
const app = require('config')
const cxnOptions = app.get('rethinkdb')
const pino = require('pino')
const fs = require('fs')
const PINO_DB_OPTION = app.get('pinoDB')
const PINO_C_OPTION = app.get('pinoConsole')
var qOptions = app.get('jOptions')
qOptions.name = 'select_worker'
const q = new Queue(cxnOptions, qOptions)

q.process(async(job, next) => {
  try {
    for (let i = 0; i < job.data.capacity; i++) {
      job.data.output[i] = {}
      job.data.output[i].selector = []
      for (let j = 0; j < job.data.input[i].selector.length; j++) {
        if(job.data.input[i].selector[j].selected){
          let t = {}
          for (key in job.data.input[i].selector[j]) {
            t[key] = job.data.input[i].selector[j][key]
          }
          job.data.output[i].selector.push(t)
        }
      }
    }
    await job.update()
    return next(null, 'success')
  } catch (err) {
    pino(PINO_C_OPTION).error(new Error('... error in process'))
    pino(PINO_DB_OPTION, fs.createWriteStream('./mylog')).error({ "error": err }, '... error in process')
    return next(new Error('error'))
  }
})

q.on('terminated', (queueId, jobId) => {
  q.getJob(jobId).then((job) => {
    func.processError(job[0].data, job[0].id)
    pino(PINO_C_OPTION).info({ 'jobId': job[0].data.id }, 'job terminated');
    pino(PINO_DB_OPTION, fs.createWriteStream('./mylog')).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'job terminated')
  }).catch(err => {
    pino(PINO_C_OPTION).error(new Error(err));
    pino(PINO_DB_OPTION, fs.createWriteStream('./mylog')).error({ "error": err }, 'job terminated')
  })
})

q.on('completed', (queueId, jobId, isRepeating) => {
  q.getJob(jobId).then((job) => {
    func.processSuccess(job[0].data, job[0].id)
    pino(PINO_C_OPTION).info({ 'jobId': job[0].data.id }, 'job completed')
    pino(PINO_DB_OPTION, fs.createWriteStream('./mylog')).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'job completed')
  }).catch(err => {
    pino(PINO_C_OPTION).error(new Error(err));
    pino(PINO_DB_OPTION, fs.createWriteStream('./mylog')).error({ "error": err }, 'job compleated')
  })
})
