var common = require('./common')
const config = require('config')
const registerWorker = config.get('registerWorker')
const pino = require('pino')
const PINO = config.get('pino')
const PINO_DB_OPTION = config.get('pinoDB')
const chokidar = require('chokidar')
const fs = require('fs')
const cxnOptions = config.get('cxnOptions')
const FLOWZ_TABLE = config.get('flowz_table')
const SCHEDULER_TABLE = config.get('scheduler_table')
const rdash = require('rethinkdbdash')(cxnOptions)
const Queue = require('rethinkdb-job-queue')

process.on('message', (m) => {
  pino(PINO).info('CHILD got message:', m)
})

const vm = require('vm')
var rp = require('request-promise')

// this is job process global variable
global.JobExecute

function getJobTypeWorkerProcess (jobType) {
  return new Promise((resolve, reject) => {
    rp(registerWorker.getJobModuleApiURL + jobType)
      .then(function (jobProcessCode) {
        resolve(jobProcessCode)
      })
      .catch(function (err) {
        reject(err)
      })
  })
}

let runWorker = function (options) {
  pino(PINO).info("Worker Start", options)
  common.getJobQueue(options).then(async result => {
    try {
      function enableWatcher(SYSTEM_LOGS_TABLE) {
        //watcher
        const CHOKIDAR_OPTION = config.get('chokidar')
        var watcher = chokidar.watch('./logs', CHOKIDAR_OPTION)

        watcher.on('change', path =>
          fs.readFile('./logs','utf8', function (err, data) {
            if (err) throw err
            let parsedData = JSON.parse(data)
            rdash.table(SYSTEM_LOGS_TABLE).insert(parsedData).run(function (err , result) {
              if (err) {
                pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).error({},err)
                pino(PINO).error({},err)
              }
            })
          })
        )
      }

      enableWatcher(config.get('system_logs_table'))

      pino(PINO).info('job queue object created', options.queue.name)
      let qObj = result.q
      qObj.process(async (job, next, onCancel) => {
        try {
          lock = true
          JobExecute(job)
            .then(result => { pino(PINO).info('worker done', options.queue.name); next(null, result) })
            .catch(err => {
              qObj.getJob(job.id).then((savedJobs) => {
                const processDate = new Date((new Date()).getTime() + (2 * 60 * 1000))
                savedJobs[0].status = 'active'
                return qObj.reanimateJob(savedJobs[0], processDate)
              }).catch(err => pino(PINO).error(err))
              pino(PINO).error('worker error', options.queue.name)
            })
          pino(PINO).info('worker name', options.queue.name)
        } catch (err) {
          pino(PINO).error('handle by try-catch', options.queue.name)
          return next(err)
        }
      })
      // qObj.on('idle', (queueId) => {
      //   if (!lock) {
      //     pino(PINO).info('Queue is idle: ' + queueId)
      //     pino(PINO).info("worker process id :", process.pid)
      //     process.send({ 'subprocess': 'exit', 'pid': process.pid })
      //     process.exit()
      //   }
      // })
      qObj.on('terminated', (queueId, jobId) => {
        qObj.getJob(jobId).then((job) => {
          processError(job[0].data, job[0].id)
          pino(PINO).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'job terminated');
          pino(PINO_DB_OPTION, fs.createWriteStream('./logs')).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'job terminated')
        }).catch(err => {
          pino(PINO).error(new Error(err));
          pino(PINO_DB_OPTION, fs.createWriteStream('./logs')).error({ "error": err }, 'job terminated')
        })
      })

      qObj.on('completed', (queueId, jobId, isRepeating) => {
        qObj.getJob(jobId).then((job) => {
          processSuccess(job[0].data, job[0].id)
          pino(PINO).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'job completed')
          pino(PINO_DB_OPTION, fs.createWriteStream('./logs')).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'job completed')
        }).catch(err => {
          pino(PINO).error(new Error(err));
          pino(PINO_DB_OPTION, fs.createWriteStream('./logs')).error({ "error": err }, 'job compleated')
        })
      })

      async function checkIdle ()
      {
        pino(PINO).warn('checking idle')
        if (qObj.idle) {
          pino(PINO).info("worker process id :", process.pid)
          process.send({ 'subprocess': 'exit', 'pid': process.pid })
          process.exit()
        }
      }

      async function processSuccess (job, jobId) {
        await notifyScheduler(job.fId, job.output, job.input, job.id, job.type, job.forProcess)
          .catch((err) => pino(PINO).error(err))
        await updateFlowInstance('completed', job.fId, job.forProcess, job.id, job.output, job.type, job.input, jobId, job.sourceCount)
        // lock = qObj.running === 0 ? false : lock
        await checkIdle()
      }

      async function processError (job, jobId) {
        await updateFlowInstance('terminated', job.fId, job.forProcess, job.id, job.output, job.type, job.input, jobId, job.sourceCount)
        await checkIdle()
        // lock = qObj.running === 0 ? false : lock
      }

      async function notifyScheduler (fId, output, input, currentProcess, processType, forProcess){
        return new Promise(async (resolve, reject) =>{
          //--------------- Queue Options -----------------
          let qOptions = {
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
          jobOptions.data.input = input
          jobOptions.data.forProcess = forProcess
          jobOptions.data.processNotification = true
          // jobOptions.timeout = TIMEOUT
          jobOptions.retryMax = 0

          //--------------- Create new job -----------------
          const job = await q.createJob(jobOptions)

          //--------------- Add job -----------------
          q.addJob(job).then((savedJobs) => {
            resolve("Done")
          }).catch(err => reject(err))
        })

      }

      async function updateFlowInstance (newStatus, fId, forProcess, current, output, type, input, jobId, sourceCount) {
        sourceCount = sourceCount ? sourceCount : []
        let tmp = await rdash.table(FLOWZ_TABLE).get(fId).update({'process_log': rdash.row('process_log').append({job: current, jobType: type.toLowerCase(), jobId: jobId, input: input, sourceCount: sourceCount, output: output, status: newStatus, lastModified: new Date()})}).run()
        pino(PINO).info({ 'fId': fId, 'jobId': current },'process in flow instance updated')
        pino(PINO_DB_OPTION, fs.createWriteStream('./logs')).info({ 'fId': fId, 'jobId': current },'process in flow instance updated')
      }
    } catch (e) {
      pino(PINO).error(e)
    }
  }).catch(e => pino(PINO).error(e))
}

module.exports.runWorker = runWorker

let executeWorker = async function (jobType, options) {
  try {
    let jobProcessCode = await getJobTypeWorkerProcess(jobType)
    const script = new vm.Script(`
      (function(require) {
        JobExecute = function(job) {
          return new Promise(
            async (resolve, reject) =>
            {
              try {
                 ` + jobProcessCode + `
              } catch(err) {
                reject({ error: err,jobdata:job})
              }
            }
          )
        }
      })`,
      { filename: 'jobProcessTrace.vm' })
    script.runInThisContext()(require)
    runWorker(options)
    pino(PINO).info('Child Process as Worker Executed')
  } catch (e) {
    pino(PINO).error(e)
    pino(PINO).error('unable to load child worker.')
  }
}

process.setMaxListeners(0)
let jobOptions = JSON.parse(process.argv[3])
executeWorker(process.argv[2], jobOptions)
