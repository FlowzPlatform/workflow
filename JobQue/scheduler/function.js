const Queue = require('rethinkdb-job-queue')
const app = require('./config.json')
const TIMEOUT = 60000*60
const _ = require('lodash')
const fs = require("fs")
const pino = require('pino')

module.exports = function (options, PINO_DB_OPTION, PINO_C_OPTION) {

  const cxnOptions = options.cxnOptions ? options.cxnOptions : app.rethinkdb
  const SCHEDULER_TABLE = options.scheduler ? options.scheduler : app.scheduler_table
  const FLOWZ_TABLE = options.fTable ? options.fTable : app.flowz_table
  const rdash = require('rethinkdbdash')(cxnOptions)

  // -------- // -------- addJob -------- // -------- //
  this.constructor.prototype.addJob = async function (processJob, processQueue, flowInstance) {
    //--------------- Add process job -----------------
    flowInstance.process_log = flowInstance.process_log ? flowInstance.process_log : []
    let newJob = await processQueue.addJob(processJob)
    flowInstance.process_log.push({job: processJob.data.id, jobType: processJob.data.type.toLowerCase(), jobId: newJob[0].id, input: processJob.data.input, status: 'created', lastModified: new Date()})
    let logAt = flowInstance.process_log.length - 1
    if (logAt != 0) {
      let tmp = await rdash.table(FLOWZ_TABLE).get(flowInstance.id).update({process_log: rdash.row('process_log').append(flowInstance.process_log[logAt])}).run()
    }
    else {
      let tmp = await rdash.table(FLOWZ_TABLE).get(flowInstance.id).update({process_log:flowInstance.process_log}).run()
    }
    // newJob[0].data.log_position = logAt
    newJob[0].status = 'created'
    newJob[0].update()
    return newJob[0]
  }

  // -------- // -------- allProcessMappingDone -------- // -------- //
  this.constructor.prototype.allProcessMappingDone = async function (targetJob, capacity, targetSchemaIndex, fId, externalCheck) {
    // let logAt = await targetJob.data.log_position
    let numberOfExternalSchema = (targetJob.data.mapping instanceof Array) ? targetJob.data.mapping.length : 1

    if (targetJob.data.input.length < capacity && numberOfExternalSchema != 0 && !externalCheck) {
      let tmp = await this.updateLog(targetJob, 'created', false)
      if (tmp) return 'done'
    }
    else {
      let requiredFieldsSkeleton = await this.getRequiredFieldsSkeleton(targetJob.data.inputProperty[0].entityschema)
      if (numberOfExternalSchema != 0 && !externalCheck){

        let sourceCounts = targetJob.data.sourceCount ? Object.values(targetJob.data.sourceCount) : []

        if (sourceCounts.length < numberOfExternalSchema || (capacity && Math.min(...sourceCounts) != capacity)) {
          let tmp = await this.updateLog(targetJob, 'created', false)
          if (tmp) return 'done'
        }
        else if (capacity){
          let tmp = await this.updateLog(targetJob, 'inputRequired', requiredFieldsSkeleton)
          if (tmp) return 'done'
        }
        else {
          let tmp = await this.updateLog(targetJob, 'mappingRequired', requiredFieldsSkeleton)
          if (tmp) return 'done'
        }
      }
      else {
        let tmp = await this.updateLog(targetJob, 'inputRequired', requiredFieldsSkeleton)
        if (tmp) return 'done'
      }
    }
  }

  // -------- // -------- areAllInputsAvailable -------- // -------- //
  this.constructor.prototype.areAllInputsAvailable = async function (targetJob, targetSchemaIndex, fId, externalCheck) {

    // get the list of all required fields from the schema
    // and see if that required-field-array is equal (or subset) to the input fields
    //HINT: try to use lodash for array operations. Map, Reduce, Contains,
    let data = targetJob.data
    let capacity = await this.getCapacity(data)

    let allInputsAvailable = await this.checkAllInputsAvailable(targetJob, capacity, externalCheck)
    if (allInputsAvailable) return true
    else {
      let tmp = await this.allProcessMappingDone(targetJob, capacity, targetSchemaIndex, fId, externalCheck)
      if (tmp == 'done') return false
    }
  }

  // -------- // -------- areAllRequiredFieldsMapped -------- // -------- //
  this.constructor.prototype.areAllRequiredFieldsMapped = async function (input, targetEntitySchema) {















































































































































































































































































































































































































































































































































































    let requiredFieldsSkeleton = await this.getRequiredFieldsSkeleton(targetEntitySchema)
    let result = await this.validate(requiredFieldsSkeleton, input)
    return result
  }

  // -------- // -------- assignValue -------- // -------- //
  this.constructor.prototype.assignValue = async function (valueToAssign, consumerField, destination) {
    if (typeof consumerField == 'object') {
      var field = Object.keys(consumerField)[0]
      destination[field] = destination[field] ? destination[field] : {}
      await this.assignValue(valueToAssign, consumerField[field], destination[field])
    }
    else {
      destination[consumerField] = valueToAssign
    }
  }

  // -------- // -------- beginProcess -------- // -------- //
  this.constructor.prototype.beginProcess = async function (childJob) {
    childJob.status = 'waiting'
    childJob.dateEnable = new Date()
    childJob.update()
    let tmp = await this.updateLog(childJob, 'processing', false)
    if (tmp) return 'done'
  }

  // -------- // -------- checkAllInputsAvailable -------- // -------- //
  this.constructor.prototype.checkAllInputsAvailable = async function (targetJob, capacity, externalCheck) {
    if (targetJob.data.inputProperty.length == 0) return true
    else if ((capacity == targetJob.data.input.length && targetJob.data.input.length != 0)|| externalCheck) {
      let targetEntitySchema = targetJob.data.inputProperty[0].entityschema
      for (let j=0; j<targetJob.data.input.length; j++) {

        //get list of fields which are required by the process but are
        //still not mapped and are available in new data
        let requiredFieldsMapped = await this.areAllRequiredFieldsMapped(targetJob.data.input[j], targetEntitySchema)
        if (!requiredFieldsMapped) {
          return false
        }
      }
      return true
    }
    else return false
  }

  // -------- // -------- checkConnection -------- // -------- //
  this.constructor.prototype.checkConnection = async function(crash, delay) {
    var r = require('rethinkdb')
    r.connect(cxnOptions, function(err, conn) {
      if (err) {
        pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).error({}, 'rethinkdb error')
        pino(PINO_C_OPTION).error({}, 'rethinkdb error')
        setTimeout(function(){
          pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).info({}, 'retrying connection')
          pino(PINO_C_OPTION).info({}, 'retrying connection')
          this.checkConnection(true, delay)
        },5000)
      }else{
        if (crash) {
          setTimeout(function(){},delay)
        }
      }
    })
  }

  // -------- // -------- createNewJobs -------- // -------- //
  this.constructor.prototype.createNewJobs = async function (targetSchema, targetSchemaIndex, flowInstance, numberOfNewDataAvailable, capacity) {

    //number of new jobs to be created
    let numberOfNewJobs = capacity ? Math.ceil(numberOfNewDataAvailable / capacity) : 1
    let newJobs = []

    for (let i=0; i < numberOfNewJobs; i++) {
      let newJob = await this.createJob(targetSchema, targetSchemaIndex, flowInstance)
      newJobs.push(newJob)
    }

    return newJobs
  }

  // -------- // -------- createJobs -------- // -------- //
  this.constructor.prototype.createJob = async function (currentProcess, forProcess, flowInstance) {
    await this.checkConnection(false, 10000)
    //--------------- Process Queue Options -----------------
    const processQueueOptions = {
      name: currentProcess.type.toLowerCase() + '_worker'
    }
    var jobOptions = {}
    jobOptions.data = currentProcess
    jobOptions.retryMax = 0
    jobOptions.data.fId = flowInstance.id
    jobOptions.data.input = jobOptions.data.input ? jobOptions.data.input : []
    jobOptions.data.output = []
    jobOptions.data.forProcess = forProcess
    jobOptions.timeout = TIMEOUT
    let delay = (currentProcess.start_delay) ? currentProcess.start_delay : 0
    let startAt = (currentProcess.start_at) ? currentProcess.start_at : new Date().getTime()
    jobOptions.dateEnable =  new Date(new Date().getTime() + 10000)
    const processQueue = new Queue(cxnOptions, processQueueOptions)

    //--------------- Create new process job -----------------
    const processJob = processQueue.createJob(jobOptions)

    return this.addJob(processJob, processQueue, flowInstance)

  }

  // -------- // -------- getCapacity -------- // -------- //
  this.constructor.prototype.getCapacity = async function (targetSchema) {

    //return max capacity of process from schema of process
    return targetSchema.capacity
  }

  // -------- // -------- getFillFromStartPoint -------- // -------- //
  this.constructor.prototype.getFillFromStartPoint = async function (targetJobs, capacity, sourceName) {
    for (let i=0; i<targetJobs.length; i++) {
      let freeSlotsAvailable = await this.getFreeSlotsAvailable(targetJobs[i], capacity, sourceName)
      if (freeSlotsAvailable > 0) {
        return i
        break
      }
    }
  }

  // -------- // -------- getFlowInstance -------- // -------- //
  this.constructor.prototype.getFlowInstance = async function (fId) {
    await this.checkConnection(false,100)
    let tmp = await rdash.table(FLOWZ_TABLE).get(fId).run()
    return tmp
  }

  // -------- // -------- getFreeSlotsAvailable -------- // -------- //
  this.constructor.prototype.getFreeSlotsAvailable = async function (targetJob, capacity, sourceName) {

    targetJob.data.sourceCount = targetJob.data.sourceCount ? targetJob.data.sourceCount : {}
    let sourceCount = targetJob.data.sourceCount[sourceName] ? targetJob.data.sourceCount[sourceName] : 0

    return capacity ? capacity - sourceCount : sourceCount != 0 ? 0 : 1
  }

  // -------- // -------- getJobFromQueue -------- // -------- //
  this.constructor.prototype.getJobFromQueue = async function (targetSchema, fId) {
    const qOptions = {
      name: targetSchema.type.toLowerCase() + '_worker'
    }
    const q = new Queue(cxnOptions, qOptions)

    let result = await q.findJob({ data : { id : targetSchema.id, fId : fId }, status : 'created' })
    if (result.length > 0) {
      return _.sortBy(result,['dateCreated'])
    } else {
      return false
    }
  }

  // -------- // -------- getMapping -------- // -------- //
  this.constructor.prototype.getMapping = async function (targetSchema, sourceName) {
    let sourceTargetMapping = _.find(targetSchema.mapping, {'sourceid': sourceName})
    let mapData = sourceTargetMapping ? sourceTargetMapping.MapData : null
    return mapData
  }

  // -------- // -------- getNextStates -------- // -------- //
  this.constructor.prototype.getNextStates = async function (flowInstance, finishedProcessIndex) {
    return flowInstance.processList[finishedProcessIndex].target
  }

  // -------- // -------- getNumberOfAllFreeSlotsAvailable -------- // -------- //
  this.constructor.prototype.getNumberOfAllFreeSlotsAvailable = async function (targetJobs, capacity, sourceName) {
    var j = 0
    var k = 0

    for (let i=0; i<targetJobs.length; i++) {
      k = i
      let freeSlotsAvailable = await this.getFreeSlotsAvailable(targetJobs[i], capacity, sourceName)
      if (freeSlotsAvailable > 0) {
        j = freeSlotsAvailable
        break
      }
    }

    return capacity ? ((targetJobs.length - (k + 1)) * capacity) + j : j
  }

  // -------- // -------- getRequiredFieldsSkeleton -------- // -------- //
  this.constructor.prototype.getRequiredFieldsSkeleton = async function (targetEntitySchema) {
    let obj = {}

    for (let i=0; i<targetEntitySchema.entity.length; i++) {
      if (targetEntitySchema.entity[i].type == 'array') {
        let tmp = await this.getRequiredFieldsSkeleton(targetEntitySchema.entity[i].items)
        let values = Object.values(tmp)
        if(values.indexOf('required') > -1) {
          obj[targetEntitySchema.entity[i].name] = [ tmp ]
        }
      }
      else if (targetEntitySchema.entity[i].type == 'object') {
        let tmp = await this.getRequiredFieldsSkeleton(targetEntitySchema.entity[i])
        let values = Object.values(tmp)
        if(values.indexOf('required') > -1) {
          obj[targetEntitySchema.entity[i].name] = tmp
        }
      }
      else {
        if (!targetEntitySchema.entity[i].property.optional) {
          obj[targetEntitySchema.entity[i].name] = 'required'
        }
      }
    }
    return obj
  }

  // -------- // -------- map -------- // -------- //
  this.constructor.prototype.map = function (producerField, consumerField, previousOutput, input, cFields, pFields) {
    if (typeof consumerField == 'object') {
      const pFieldTitle = Object.keys(producerField)[0]
      const cFieldTitle = Object.keys(consumerField)[0]
      const cSchema = _.find(cFields, {'title': cFieldTitle})
      const cField = cSchema.name
      const pSchema = _.find(pFields, {'title': pFieldTitle})
      const pField = pSchema.name
      if (previousOutput[pField] instanceof Array) {
        input[cField] = input[cField] ? input[cField] : []
        for (let j=0; j<previousOutput[pField].length; j++) {
          input[cField][j] = input[cField][j] ? input[cField][j] : {}
          this.map(producerField[pFieldTitle], consumerField[cFieldTitle], previousOutput[pField][j], input[cField][j], cSchema.items.entity, pSchema.items.entity)
        }
      }
      else if (typeof previousOutput[pField] == 'object') {
        input[cField] = input[cField] ? input[cField] : {}
        this.map(producerField[pFieldTitle], consumerField[cFieldTitle], previousOutput[pField], input[cField], cSchema.entity, pSchema.entity)
      }
    }
    else {
      input[consumerField] = previousOutput[producerField]
    }
  }

  // -------- // -------- mapExternalInputs -------- // -------- //
  this.constructor.prototype.mapExternalInputs = async function (externalInput, targetJobs, numberOfExternalInputs, capacity, fillFrom) {

    //to keep track of as to how much of new data got mapped
    var outputsMapped = 0

    for (let i=fillFrom; i<targetJobs.length; i++) {

      //get number of new data remaining available for mapping
      let numberOfNewDataRemaining = numberOfExternalInputs - outputsMapped

      let loopEnd = capacity ? capacity : 1
      //e.g.
      //if process has max capacity of 5 and currently requires 2 more slots to be filled,
      //i.e. its first 3 slots are already filled, we will start mapping from index 5-2 (i.e. 3),
      //as slots 0, 1 and 2 are already occupied
      for (let j=0; j<loopEnd; j++) {
        if (capacity) {
          targetJobs[i].data.input[j] = externalInput[outputsMapped]

          //increment the new data consumed in mapping
          outputsMapped++
        }
        else {
          targetJobs[i].data.input = externalInput
        }
      }
      //check if all new data are mapped and if they are, break the loop and stop mapping
      if (outputsMapped == numberOfExternalInputs) break
    }
  }

  // -------- // -------- mapOutputsToChildInputs -------- // -------- //
  this.constructor.prototype.mapOutputsToChildInputs = async function (targetJobs, sourceTargetMapping, sourceOutput, capacity, numberOfNewDataAvailable, fillFrom, sourceName, notifyingProcessSchema, outputPropertyIndex) {

    //to keep track of as to how much of new data got mapped
    var outputsMapped = 0

    for (let i=fillFrom; i<targetJobs.length; i++) {

      //get number of free slots in available target process for given source process
      let freeSlotsAvailable = await this.getFreeSlotsAvailable(targetJobs[i], capacity, sourceName)

      //find index from which the mapping should be done
      let mapFromIndex = capacity ? capacity - freeSlotsAvailable : 0

      //get number of new data remaining available for mapping
      let numberOfNewDataRemaining = numberOfNewDataAvailable - outputsMapped

      //if number of new data remaining is less than slots to be filled, loop should end after all
      let loopEnd = freeSlotsAvailable > numberOfNewDataRemaining  && capacity ? mapFromIndex + numberOfNewDataRemaining : capacity ? capacity : 1
      //e.g.
      //if process has max capacity of 5 and currently requires 2 more slots to be filled,
      //i.e. its first 3 slots are already filled, we will start mapping from index 5-2 (i.e. 3),
      //as slots 0, 1 and 2 are already occupied

      for (let j=mapFromIndex; j<loopEnd; j++) {
        //increment the sourceCount of source and initiate it to 1 if already not present
        targetJobs[i].data.sourceCount[sourceName] = targetJobs[i].data.sourceCount[sourceName] ? targetJobs[i].data.sourceCount[sourceName] + 1 : 1

        //if mapping between given source and target is defined, perform mapping based on that mapping
        if (sourceTargetMapping && capacity) {

          targetJobs[i].data.input[j] = await targetJobs[i].data.input[j] ? targetJobs[i].data.input[j] : {}

          for (var k=0; k<sourceTargetMapping.length; k++) {
            // let valueToAssign
            if (sourceTargetMapping[k].producerField != -1) {
              //get value from source to be mapped if producerField is not equal to 1
              //it will be equal to 1 if transform function is used instead of producerField

              this.map(sourceTargetMapping[k].producerField, sourceTargetMapping[k].consumerField, sourceOutput[outputsMapped], targetJobs[i].data.input[j], targetJobs[i].data.inputProperty[0].entityschema.entity, notifyingProcessSchema.outputProperty[outputPropertyIndex].entityschema.entity)
            }
            else {
              //if transform function is used, execute the transform function and get value to be assigned
              let transform = new Function(['source'], sourceTargetMapping[k].transform)
              valueToAssign = transform.call(null, sourceOutput[outputsMapped])
            }
            //find field in target where the value obtained from the above step needs to be mapped
            //and map the value to that field
            // await this.assignValue(valueToAssign, sourceTargetMapping[k].consumerField, targetJobs[i].data.input[j])
          }
          //increment the new data consumed in mapping
          outputsMapped++
        }
        else if (sourceTargetMapping) {
          let obj = {}
          obj.source = sourceName
          obj.inputs = []

          for (;outputsMapped < numberOfNewDataRemaining; outputsMapped++) {
            obj.inputs[outputsMapped] = {}

            for (var k=0; k<sourceTargetMapping.length; k++) {
              let valueToAssign
              if (sourceTargetMapping[k].producerField != -1) {
                // get value from source to be mapped if producerField is not equal to 1
                // it will be equal to 1 if transform function is used instead of producerField
                this.map(sourceTargetMapping[k].producerField, sourceTargetMapping[k].consumerField, sourceOutput[outputsMapped], obj.inputs[outputsMapped], targetJobs[i].data.inputProperty[0].entityschema.entity)
              }
              else {
                //if transform function is used, execute the transform function and get value to be assigned
                let transform = new Function(['source'], sourceTargetMapping[k].transform)
                valueToAssign = transform.call(null, sourceOutput[outputsMapped])
              }
              //find field in target where the value obtained from the above step needs to be mapped
              //and map the value to that field
              // await this.assignValue(valueToAssign, sourceTargetMapping[k].consumerField, obj.inputs[outputsMapped])
            }
          }
          targetJobs[i].data.input.push(obj)
        }
        else {
          targetJobs[i].data.input = sourceOutput
        }
      }
      //check if all new data are mapped and if they are, break the loop and stop mapping
      if (outputsMapped == numberOfNewDataAvailable) break
    }
  }

  // -------- // -------- newInstance -------- // -------- //
  this.constructor.prototype.newInstance = async function (flowInstance, fId) {
    for (let i=0; i<flowInstance.start_states.length; i++) {

      let startStateId = flowInstance.start_states[i]
      //get process object and process index from the processlist
      //for the start type process
      let startProcess = _.find(flowInstance.processList,{'id':startStateId})
      let startProcessIndex = _.findIndex(flowInstance.processList,{'id':startStateId})

      //create job for the start type process in it's respective worker
      let startJob = await this.createJob(startProcess, startProcessIndex, flowInstance)

      //get boolean to check if all input required to begin this start type process are available or not
      let inputAvailability = await this.areAllInputsAvailable(startJob, startProcessIndex, fId, false)

      //if all inputs are available to begin the process, call begin process function
      if (inputAvailability) {
        pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).info({'fId': fId, 'jobId': startStateId}, 'next job')
        pino(PINO_C_OPTION).info({'fId': fId, 'jobId': startStateId}, 'next job')
        await this.beginProcess(startJob)
      }
      else {
        pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).warn({'fId': fId, 'jobId': startStateId}, 'all inputs not available')
        pino(PINO_C_OPTION).warn({'fId': fId, 'jobId': startStateId}, 'all inputs not available')
      }
    }
  }

  // -------- // -------- notificationACK -------- // -------- //
  this.constructor.prototype.notificationACK = async function (flowInstance, fId, jobData, next) {
    //get all next states of the completed process
    let forProcess = jobData.forProcess
    let targetProcesses = await this.getNextStates(flowInstance, forProcess)

    //if process has next state, the condition will be satisfied
    //in case of end process, there will be no next states
    if (targetProcesses.length > 0) {

      let notifyingProcessSchema = flowInstance.processList[forProcess]
      let processList = flowInstance.processList
      //loop over each possible next state of the finished process, verify if that next state
      //satisfies the condition to be executed(if any), and if does call performTargetOperation
      for (let i=0; i<targetProcesses.length; i++) {
        let targetProcess = targetProcesses[i]

        let goToTargetCondition = targetProcess.condition //get the condition for the next state if any
        if (goToTargetCondition) {

          //verify the condition
          let isConditionSatisfied = await this.verifyCondition(targetProcess.condition, jobData.input, jobData.output)

          //if condition verified, call performTargetOperation
          if (isConditionSatisfied) {
            let tmp = await this.performTargetOperation(processList, targetProcess, jobData, flowInstance, notifyingProcessSchema)
          }
        }
        else {
          //i.e. no condition for this next state, so call performTargetOperation anyway
          let tmp = await this.performTargetOperation(processList, targetProcess, jobData, flowInstance, notifyingProcessSchema)
        }
      }
      return next(null, 'success')
    }
    else {
      //i.e. the process completed has no next state
      //in ideal scenerio, this will happen only if the process completed is of `end` type

      pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).info({'fId': fId, 'jobId': jobData.currentProcess}, 'End Process')
      pino(PINO_C_OPTION).info({'fId': fId, 'jobId': jobData.currentProcess}, 'end process')
      return next(null, 'success')
    }
  }

  // -------- // -------- performExternalOperation -------- // -------- //
  this.constructor.prototype.performExternalOperation = async function (flowInstance, jobData, fId) {

    if (jobData.input) {

      let targetId = jobData.jobId //id of the job for which the input was supplied
      let externalInput = (jobData.input instanceof Array) ? jobData.input : [jobData.input] //get external inputs

      //get process object and process index from the processlist
      //for which the input was supplied
      targetSchema = _.find(flowInstance.processList,{'id': targetId})
      targetSchemaIndex = _.findIndex(flowInstance.processList,{'id': targetId})

      //get job from its respective worker
      let targetJobs = await this.getJobFromQueue(targetSchema, fId)

      //get array size of external inputs
      let numberOfExternalInputs = externalInput.length

      //get max size of input array that process accepts
      let capacity = await this.getCapacity(targetSchema)

      //get start point from where external inputs mapping will start_start
      let fillFrom = 0

      //map supplied external inputs
      await this.mapExternalInputs(externalInput, targetJobs, numberOfExternalInputs, capacity, fillFrom)

      let numberOfUpdatedJobs = capacity ? Math.ceil(numberOfExternalInputs / capacity) : 1
      numberOfUpdatedJobs = targetJobs.length < numberOfUpdatedJobs ? targetJobs.length : numberOfUpdatedJobs

      //for each updated job, check if all inputs required by the process are available or not
      //if all inputs are available, begin the target process
      //else update the target process in its respective job queue to latest mapping
      for (let i=fillFrom; i<numberOfUpdatedJobs; i++) {

        //get boolean to check if all inputs needed by the process to start are now all available or not
        let inputAvailability = await this.areAllInputsAvailable(targetJobs[i], targetSchemaIndex, fId, true)

        if (inputAvailability) {
          //if all inputs are available, update the latest mapping done and begin the process
          //i.e. change status of the job for that process in it's respective worker queue to `waiting`
          pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).info({'fId': jobData.fId, 'jobId': targetSchema.id}, 'next job')
          pino(PINO_C_OPTION).info({'fId': jobData.fId, 'jobId': targetSchema.id}, 'next job')
          let tmp = await this.beginProcess(targetJobs[i])
        }
        else {
          //i.e. all inputs are still not available so just update the latest mapping done
          //(it's status in it's respective worker queue will not be changed)
          pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).warn({'fId': jobData.fId, 'jobId': targetSchema.id}, 'all inputs not available')
          pino(PINO_C_OPTION).warn({'fId': jobData.fId, 'jobId': targetSchema.id}, 'all inputs not available')
          let tmp = await this.updateProcess(targetJobs[i])
        }
      }
      return 'done'
    }
  }

  // -------- // -------- performTargetOperation -------- // -------- //
  this.constructor.prototype.performTargetOperation = async function (processList, target, jobData, flowInstance, notifyingProcessSchema) {
    let targetId = target.id
    let fId = flowInstance.id //get database id of flowInstance to which it belongs
    let targetSchema = _.find(processList,{'id': targetId}) //get process block from processList based on targetId
    let targetSchemaIndex = _.findIndex(processList,{'id': targetId}) //get index of process block from processList based on targetId
    //if output of previous data is single object, convert it to array
    let sourceOutput = (jobData.output instanceof Array) ? jobData.output : target.outputid ? jobData.output[target.outputid] : [jobData.output]
    let outputPropertyIndex = target.outputid ? _.findIndex(notifyingProcessSchema.outputProperty, {id: target.outputid}) : 0
    let sourceName = jobData.currentProcess //variable to store id of process which got completed

    //get all child jobs from the respective child type queue whose status is `parameterMapping`
    let targetJobs = await this.getJobFromQueue(targetSchema, fId)
    //to know from where to start filling the free slot
    let fillFrom = null

    //find number of new available data
    let numberOfNewDataAvailable = sourceOutput.length

    //get mapping for the given source process in the target process
    let sourceTargetMapping = await this.getMapping(targetSchema, sourceName)

    //get max size of input array that process accepts
    let capacity = await this.getCapacity(targetSchema)

    //if no child job is present in the respective child type queue, create new job in the
    //respective child type queue
    if (!targetJobs) {

      //function to create new jobs
      targetJobs = await this.createNewJobs(targetSchema, targetSchemaIndex, flowInstance, numberOfNewDataAvailable, capacity)
      fillFrom = 0
    }
    else {

      //from targetJobs got, get size of data they can handle
      let numberOfAllFreeSlotsAvailbale = await this.getNumberOfAllFreeSlotsAvailable(targetJobs, capacity, sourceName)

      //check if numberOfAllFreeSlotsAvailbale is enough for the new data
      newJobsRequired = (numberOfAllFreeSlotsAvailbale - numberOfNewDataAvailable) > 0 ? false : capacity ? true : numberOfAllFreeSlotsAvailbale == 0 ? true : false

      //if numberOfAllFreeSlotsAvailbale is not enough, create new jobs and add them to array targetJobs
      if (newJobsRequired) {

        let newJobs = await this.createNewJobs(targetSchema, targetSchemaIndex, flowInstance, numberOfNewDataAvailable-numberOfAllFreeSlotsAvailbale, capacity)
        targetJobs = targetJobs.concat(newJobs)
      }

      //function to get start point from where mapping needs to be done
      fillFrom = await this.getFillFromStartPoint(targetJobs, capacity, sourceName)
    }

    //map the source output to target input based on the mapping defined
    await this.mapOutputsToChildInputs(targetJobs, sourceTargetMapping, sourceOutput, capacity, numberOfNewDataAvailable, fillFrom, sourceName, notifyingProcessSchema, outputPropertyIndex)

    //get number of updated jobs
    let numberOfUpdatedJobs = capacity ? Math.ceil(numberOfNewDataAvailable / capacity) : 1

    //for each updated job, check if all inputs required by the process are available or not
    //if all inputs are available, begin the target process
    //else update the target process in its respective job queue to latest mapping
    for (let i=fillFrom; i<numberOfUpdatedJobs; i++) {

      //get boolean to check if all inputs needed by the process to start are now all available or not
      let inputAvailability = await this.areAllInputsAvailable(targetJobs[i], targetSchemaIndex, fId, false)

      if (inputAvailability) {
        //if all inputs are available, update the latest mapping done and begin the process
        //i.e. change status of the job for that process in it's respective worker queue to `waiting`
        pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).info({'fId': fId, 'jobId': targetId}, 'next job')
        pino(PINO_C_OPTION).info({'fId': fId, 'jobId': targetId}, 'next job')
        let tmp = await this.beginProcess(targetJobs[i])
      }
      else {
        //i.e. all inputs are still not available so just update the latest mapping done
        //(it's status in it's respective worker queue will not be changed)
        pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).warn({'fId': fId, 'jobId': targetId}, 'all inputs not available')
        pino(PINO_C_OPTION).warn({'fId': fId, 'jobId': targetId}, 'all inputs not available')
        let tmp = await this.updateProcess(targetJobs[i])
      }
    }
    return 'success'
  }

  // -------- // -------- updateLog -------- // -------- //
  this.constructor.prototype.updateLog = async function (targetJob, status, requiredFieldsSkeleton) {
    let data = targetJob.data
    let sourceCount = data.sourceCount ? data.sourceCount : []
    if (requiredFieldsSkeleton) {
      return rdash.table(FLOWZ_TABLE).get(data.fId).update({process_log: rdash.row('process_log').append({job: data.id, jobType: data.type.toLowerCase(), jobId: targetJob.id, input: data.input, sourceCount: sourceCount, status: status, requiredFields: requiredFieldsSkeleton, lastModified: new Date()})}).run()
    }
    else {
      return rdash.table(FLOWZ_TABLE).get(data.fId).update({process_log: rdash.row('process_log').append({job: data.id, jobType: data.type.toLowerCase(), jobId: targetJob.id, input: data.input, sourceCount: sourceCount, status: status, lastModified: new Date()})}).run()
    }
  }

  // -------- // -------- updateProcess -------- // -------- //
  this.constructor.prototype.updateProcess = async function (childJob) {
    await childJob.update()
    return 'done'
  }

  // -------- // -------- validate -------- // -------- //
  this.constructor.prototype.validate = async function (req, tc) {
    if (req instanceof Array) {
      let testField = req[0]
      for (let i=0; i<tc.length; i++) {
        if (!await this.validate(testField, tc[i])) return false
      }
    }
    else {
      for (field in req) {
        if (req[field] instanceof Array || typeof req[field] == 'object') {
          let tmpResult =  tc[field] ? await this.validate(req[field], tc[field]) : false
          if (!tmpResult) return false
        }
        else if (!tc[field] && tc[field] != false) return false
      }
    }
    return true
  }

  // -------- // -------- verifyCondition -------- // -------- //
  this.constructor.prototype.verifyCondition = async function (conditions, input, output) {
    for (let i=0; i<conditions.length; i++) {
      let condition = conditions[i]
      if (!eval(condition)) {
        return false
      }
    }
    return true
  }
}
