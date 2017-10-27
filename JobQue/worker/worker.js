const Queue = require('rethinkdb-job-queue')
const func = require('./function')
const app = require('config')
const pino = require('pino')
const fs = require('fs')
const PINO_DB_OPTION = app.get('pinoDB')
const PINO_C_OPTION = app.get('pinoConsole')

module.exports = (cxnOptions, qOptions, user_function) => {
  const q = new Queue(cxnOptions, qOptions)

  q.process(async(job, next) => {
    try {
      if (!user_function) {
        for (let i = 0; i < job.data.capacity; i++) {
          job.data.output[i] = {}
          for (key in job.data.input[i]) {
            job.data.output[i][key] = job.data.input[i][key]
          }
        }
        await job.update()
      }
      else if (typeof user_function == 'function') {
        var output = user_function.call(null, job.data.input)
        // output = output instanceof Array ? output : [output]
        job.data.output = output
        await job.update()
      }
      return next(null, 'success')
    } catch (err) {
      pino(PINO_C_OPTION).error(new Error('... error in process'))
      pino(PINO_DB_OPTION, fs.createWriteStream('./mylog')).error({ "error": err }, 'error in process')
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
}
