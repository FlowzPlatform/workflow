const Queue = require('rethinkdb-job-queue')
const app = require('./config.json')
const _ = require('lodash')
const chokidar = require('chokidar')
const fs = require("fs")
const pino = require('pino')

module.exports = function (options) {

  options = options ? options : {}
  const cxnOptions = options.cxnOptions ? options.cxnOptions : app.rethinkdb
  const qOptions = options.qOptions ? options.qOptions : app.qOptions
  var PINO_DB_OPTION = app.pinoDB
  var PINO_C_OPTION = app.pinoConsole
  const scheduler_functions = require('./function')
  const q = new Queue(cxnOptions, qOptions)
  const rdash = require('rethinkdbdash')(cxnOptions)

  if (options.logs) {
    if (options.logs.console == false) PINO_C_OPTION.level = 'silent'
    if (options.logs.db == false) {
      PINO_DB_OPTION.level = 'silent'
    }
    else {
      const SYSTEM_LOGS_TABLE = options.logs.table ? options.logs.table : app.system_logs_table
      enableWatcher(logs_table)
    }
  }
  else {
    enableWatcher(app.system_logs_table)
  }

  function enableWatcher(SYSTEM_LOGS_TABLE) {
    //watcher
    const CHOKIDAR_OPTION = app.chokidar
    var watcher = chokidar.watch('./logs', CHOKIDAR_OPTION)

    watcher.on('change', path =>
      fs.readFile('./logs','utf8', function (err, data) {
        if (err) throw err
        let parsedData = JSON.parse(data)
        rdash.table(SYSTEM_LOGS_TABLE).insert(parsedData).run(function (err , result) {
          if (err) {
            pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).error({},err)
            pino(PINO_C_OPTION).error({},err)
          }
        })
      })
    )
  }

  const func = new scheduler_functions(options, PINO_DB_OPTION, PINO_C_OPTION)

  q.process(async (job, next) => {
    try {

      const fId = job.data.fId
      const flowInstance = await func.getFlowInstance(fId) //get flow instance from db

      if (job.data.processNotification) {
        //the condition will be satisfied if the job is created by some process worker as a part
        //of notifying schcduler that the process completed succesfully a that particular worker

        func.notificationACK(flowInstance, fId, job.data, next)
      }
      else if (job.data.isExternalInput) {
        //the condition will be satisfied if the job is created in
        //order to provide external input to certain process

        let tmp = await func.performExternalOperation(flowInstance, job.data, fId)
        if (tmp == 'done') return next(null, 'success')
      }
      else {
        //i.e. the job in scheduler was created as a result of a new flowz instance
        await func.newInstance(flowInstance, fId)
        return next(null, 'success')
      }
    } catch (err) {
      pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).error({},'... error in process\n'+err)
      pino(PINO_C_OPTION).error({},'... error in process '+err)
      return next(err)
    }
  })
}
