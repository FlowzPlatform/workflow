const Queue = require('rethinkdb-job-queue')
const app = require('./config.json')
const pino = require('pino')
const chokidar = require('chokidar')
const fs = require('fs')
module.exports = function(options, user_function) {
  options = options ? options : {}
  const cxnOptions = options.cxnOptions ? options.cxnOptions : app.rethinkdb
  const qOptions = options.qOptions ? options.qOptions : app.qOptions
  var PINO_DB_OPTION = app.pinoDB
  var PINO_C_OPTION = app.pinoConsole
  const worker_functions = require('./function')
  const q = new Queue(cxnOptions, qOptions)
  const rdash = require('rethinkdbdash')(cxnOptions)
  if (options.logs) {
    if (options.logs.console == false) {
      PINO_C_OPTION.level = 'silent'
    }
    if (options.logs.db == false) {
      PINO_DB_OPTION.level = 'silent'
    } else {
      var logs_table = options.logs.table ? options.logs.table : app.system_logs_table
      enableWatcher(logs_table)
    }
  } else {
    enableWatcher(app.system_logs_table)
  }

  function enableWatcher(SYSTEM_LOGS_TABLE) {
    //watcher
    const CHOKIDAR_OPTION = app.chokidar
    var watcher = chokidar.watch('./logs', CHOKIDAR_OPTION)
    watcher.on('change', path =>
      fs.readFile('./logs', 'utf8', function(err, data) {
        if (err) throw err
        let parsedData = JSON.parse(data)
        rdash.table(SYSTEM_LOGS_TABLE).insert(parsedData).run(function(err, result) {
          if (err) {
            pino(PINO_DB_OPTION, fs.createWriteStream('./logs')).error({}, err)
            pino(PINO_C_OPTION).error({}, err)
          }
        })
      })
    )
  } else {
    const SYSTEM_LOGS_TABLE = app.system_logs_table
    //watcher
    const CHOKIDAR_OPTION = app.chokidar
    var watcher = chokidar.watch('./logs', CHOKIDAR_OPTION)
    console.log(SYSTEM_LOGS_TABLE, CHOKIDAR_OPTION)
    watcher.on('change', path =>
      fs.readFile('./logs', 'utf8', function(err, data) {
        if (err) throw err
        console.log('changes')
        let parsedData = JSON.parse(data)
        rdash.table(SYSTEM_LOGS_TABLE).insert(parsedData).run(function(err, result) {
          if (err) {
            pino(PINO_DB_OPTION, fs.createWriteStream('./logs')).error({}, err)
            pino(PINO_C_OPTION).error({}, err)
          }
        })
      })
    )
  }
  const func = new worker_functions(options, PINO_DB_OPTION, PINO_C_OPTION)
  q.process(async(job, next) => {
    try {
      if (!user_function) {
        for (let i = 0; i < job.data.input.length; i++) {
          job.data.output[i] = {}
          for (key in job.data.input[i]) {
            job.data.output[i][key] = job.data.input[i][key]
          }
        }
        await job.update()
      } else if (typeof user_function == 'function') {
        var output = user_function.call(null, job.data.input)
          // output = output instanceof Array ? output : [output]
        job.data.output = output
        await job.update()
      }
      return next(null, 'success')
    } catch (err) {
      pino(PINO_C_OPTION).error(new Error('... error in process'))
      pino(PINO_DB_OPTION, fs.createWriteStream('./logs')).error({ "error": err }, 'error in process')
      return next(new Error('error'))
    }
  })
  q.on('terminated', (queueId, jobId) => {
    q.getJob(jobId).then((job) => {
      func.processError(job[0].data, job[0].id)
      pino(PINO_C_OPTION).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'job terminated');
      pino(PINO_DB_OPTION, fs.createWriteStream('./logs')).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'job terminated')
    }).catch(err => {
      pino(PINO_C_OPTION).error(new Error(err));
      pino(PINO_DB_OPTION, fs.createWriteStream('./logs')).error({ "error": err }, 'job terminated')
    })
  })
  q.on('completed', (queueId, jobId, isRepeating) => {
    q.getJob(jobId).then((job) => {
      func.processSuccess(job[0].data, job[0].id)
      pino(PINO_C_OPTION).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'job completed')
      pino(PINO_DB_OPTION, fs.createWriteStream('./logs')).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'job completed')
    }).catch(err => {
      pino(PINO_C_OPTION).error(new Error(err));
      pino(PINO_DB_OPTION, fs.createWriteStream('./logs')).error({ "error": err }, 'job compleated')
    })
  })
}