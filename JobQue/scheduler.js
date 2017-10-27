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

      //get all next states of the completed process
      let targetProcesses = await func.getNextStates(flowInstance, job.data.forProcess)
      let notifyingProcessSchema = flowInstance.processList[job.data.forProcess]

      //if process has next state, the condition will be satisfied
      //in case of end process, there will be no next states
      if (targetProcesses.length > 0) {

        let processList = flowInstance.processList
        //loop over each possible next state of the finished process, verify if that next state
        //satisfies the condition to be executed(if any), and if does call performTargetOperation
        for (let i=0; i<targetProcesses.length; i++) {
          let targetProcess = targetProcesses[i]

          let goToTargetCondition = targetProcess.condition //get the condition for the next state if any
          if (goToTargetCondition) {

            //verify the condition
            let isConditionSatisfied = await func.verifyCondition(targetProcess.condition, job.data.input, job.data.output)

            //if condition verified, call performTargetOperation
            if (isConditionSatisfied) {
              let tmp = await func.performTargetOperation(processList, targetProcess, job.data, flowInstance, notifyingProcessSchema)
            }
          }
          else {
            //i.e. no condition for this next state, so call performTargetOperation anyway
            let tmp = await func.performTargetOperation(processList, targetProcess, job.data, flowInstance, notifyingProcessSchema)
          }
        }
        return next(null, 'success')
      }
      else {
      //i.e. the process completed has no next state
      //in ideal scenerio, this will happen only if the process completed is of `end` type

        pino(PINO_DB_OPTION,fs.createWriteStream('./worker/mylog')).info({'fId': job.data.fId, 'jobId': job.data.currentProcess}, 'End Process')
        pino(PINO_C_OPTION).info({'fId': job.data.fId, 'jobId': job.data.currentProcess}, 'end process')
        return next(null, 'success')
      }
    }
    else if (job.data.isExternalInput) {
    //the condition will be satisfied if the job is created in
    //order to provide external input to certain process

      let tmp = await func.performExternalOperation(flowInstance, job.data, fId)
      if (tmp == 'done') return next(null, 'success')
    }
    else {
      //i.e. the job in scheduler was created as a result of a new flowz instance

      for (let i=0; i<flowInstance.start_states.length; i++) {

        let startStateId = flowInstance.start_states[i]
        //get process object and process index from the processlist
        //for the start type process
        let startProcess = _.find(flowInstance.processList,{'id':startStateId})
        let startProcessIndex = _.findIndex(flowInstance.processList,{'id':startStateId})

        //create job for the start type process in it's respective worker
        let startJob = await func.createJob(startProcess, startProcessIndex, flowInstance)

        //get boolean to check if all input required to begin this start type process are available or not
        let inputAvailability = await func.areAllInputsAvailable(startJob, startProcessIndex, fId, false)

        //if all inputs are available to begin the process, call begin process function
        if (inputAvailability) {
          pino(PINO_DB_OPTION,fs.createWriteStream('./worker/mylog')).info({'fId': fId, 'jobId': startStateId}, 'next job')
          pino(PINO_C_OPTION).info({'fId': fId, 'jobId': startStateId}, 'next job')
          await func.beginProcess(startJob)
        }
        else {
          pino(PINO_DB_OPTION,fs.createWriteStream('./worker/mylog')).warn({'fId': fId, 'jobId': startStateId}, 'all inputs not available')
          pino(PINO_C_OPTION).warn({'fId': fId, 'jobId': startStateId}, 'all inputs not available')
        }
      }

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
    if (err) throw err;
    let parsedData = JSON.parse(data);
    rdash.table(SYSTEM_LOGS_TABLE).insert(parsedData).run(function(err , result){
      if (err) {
        pino(PINO_DB_OPTION,fs.createWriteStream('./worker/mylog')).error({},err)
        pino(PINO_C_OPTION).error({},err)
      }
    })
  })
)
