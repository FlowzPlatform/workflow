const Queue = require('rethinkdb-job-queue')
const func = require('./function')
const app = require('config')
const cxnOptions = app.get('rethinkdb')
const qOptions = app.get('qOptions')
const q = new Queue(cxnOptions, qOptions)
const _ = require('lodash')
const chokidar = require('chokidar')
const fs = require("fs")
const SYSTEM_LOGS_TABLE = app.get('system_logs_table')
const rdash = require('rethinkdbdash')(cxnOptions)
const pino = require('pino')
const PINO_DB_OPTION = app.get('pinoDB')
const PINO_C_OPTION = app.get('pinoConsole')
const CHOKIDAR_OPTION = app.get('chokidar')

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
    pino(PINO_DB_OPTION,fs.createWriteStream('./worker/mylog')).error({},'... error in process\n'+err)
    pino(PINO_C_OPTION).error({},'... error in process '+err)
    return next(err)
  }
})

//watcher
var watcher = chokidar.watch('./worker/mylog', CHOKIDAR_OPTION)

watcher.on('change', path =>
  fs.readFile('./worker/mylog','utf8', function (err, data) {
    if (err) throw err
    let parsedData = JSON.parse(data)
    rdash.table(SYSTEM_LOGS_TABLE).insert(parsedData).run(function(err , result){
      if (err) {
        pino(PINO_DB_OPTION,fs.createWriteStream('./worker/mylog')).error({},err)
        pino(PINO_C_OPTION).error({},err)
      }
    })
  })
)
