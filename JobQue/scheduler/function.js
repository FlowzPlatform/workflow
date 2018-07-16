const Queue = require('rethinkdb-job-queue')
const app = require('./default.json')
const TIMEOUT = 60000*60
const _ = require('lodash')
const fs = require("fs")
const pino = require('pino')
const axios = require('axios')
const cp = require('child_process')

module.exports = function (options, PINO_DB_OPTION, PINO_C_OPTION) {

  const FIND_URL = options.serviceURL ? options.serviceURL + app.service.find : app.serviceURL + app.service.find
  const UPDATE_URL = options.serviceURL ? options.serviceURL + app.service.update : app.serviceURL + app.service.update
  const CREATE_URL = options.serviceURL ? options.serviceURL + app.service.create : app.serviceURL + app.service.create
  const PROCESS_URL = options.jobURL ? options.jobURL + app.service.job_module : app.serviceURL + app.service.job_module
  const cxnOptions = options.cxnOptions ? options.cxnOptions : app.rethinkdb
  const SCHEDULER_TABLE = options.scheduler ? options.scheduler : app.scheduler_table
  const FLOWZ_TABLE = options.fTable ? options.fTable : app.flowz_table
  const CACHE_SIZE = options.cache ? options.cache : options.cache == false ? 1 : app.cache_size
  const RUNTIME_PROCESS_TABLE = app.runtime_process_table
  var cache = []
  const rdash = require('rethinkdbdash')(cxnOptions)

  rerunProcess()

  // -------- // -------- allProcessMappingDone -------- // -------- //
  this.constructor.prototype.allProcessMappingDone = async function (targetJob, capacity, targetSchemaIndex, fId, externalCheck) {
    return new Promise (async (resolve,reject) => {
      let numberOfExternalSchema = targetJob.data.executeAny ? targetJob.data.executeAny : (targetJob.data.mapping instanceof Array) ? targetJob.data.mapping.length : 1

      if (targetJob.data.input.length < capacity && numberOfExternalSchema != 0 && !externalCheck) {
        await this.updateLog(targetJob, 'created', false)
        resolve('done')
      }
      else {
        let requiredFieldsSkeleton = await this.getRequiredFieldsSkeleton(targetJob.data.inputProperty[0].entityschema)
        if (numberOfExternalSchema != 0 && !externalCheck) {

          let sourceCounts = targetJob.data.sourceCount ? Object.values(targetJob.data.sourceCount) : []

          if (sourceCounts.length < numberOfExternalSchema || (capacity && Math.min(...sourceCounts) != capacity)) {
            await this.updateProcess(targetJob, 'created')
            await this.updateLog(targetJob, 'created', false)
            resolve('done')
          }
          else if (capacity) {
            await this.updateProcess(targetJob, 'inputRequired')
            await this.updateLog(targetJob, 'inputRequired', requiredFieldsSkeleton)
            resolve('done')
          }
          else {
            await this.updateProcess(targetJob, 'mappingRequired')
            await this.updateLog(targetJob, 'mappingRequired', requiredFieldsSkeleton)
            resolve('done')
          }
        }
        else {
          await this.updateProcess(targetJob, 'inputRequired')
          await this.updateLog(targetJob, 'inputRequired', requiredFieldsSkeleton)
          resolve('done')
        }
      }
    })
  }

  // -------- // -------- areAllInputsAvailable -------- // -------- //
  this.constructor.prototype.areAllInputsAvailable = async function (targetJob, targetSchemaIndex, fId, externalCheck) {
    return new Promise (async (resolve, reject) => {
      // get the list of all required fields from the schema
      // and see if that required-field-array is equal (or subset) to the input fields
      //HINT: try to use lodash for array operations. Map, Reduce, Contains,
      let data = targetJob.data
      let capacity = await this.getCapacity(data)

      let allInputsAvailable = await this.checkAllInputsAvailable(targetJob, capacity, externalCheck)
      if (allInputsAvailable) resolve(true)
      else {
        await this.allProcessMappingDone(targetJob, capacity, targetSchemaIndex, fId, externalCheck)
        resolve(false)
      }
    })
  }

  // -------- // -------- areAllRequiredFieldsMapped -------- // -------- //
  this.constructor.prototype.areAllRequiredFieldsMapped = async function (input, targetEntitySchema) {
    return new Promise (async (resolve, reject) => {
      let requiredFieldsSkeleton = await this.getRequiredFieldsSkeleton(targetEntitySchema)
      let result = await this.validate(requiredFieldsSkeleton, input)
      resolve(result)
    })
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
    return new Promise (async (resolve, reject) => {
      try {
        var response = await axios.post(UPDATE_URL, {
          "connection": cxnOptions,
          "queue": {
            "name": childJob.data.type.toLowerCase() + '_worker'
          },
          "findVal": {
            "id": childJob.id
          },
          "data": childJob.data,
          "options": {
            "status": "waiting"
          }
        })
        await this.updateLog(childJob, 'processing', false)
        resolve('done')
      }
      catch (error) {
        pino(PINO_C_OPTION).error(error)
        pino(PINO_DB_OPTION).error(error)
        resolve('error')
      }
    })
  }

  // -------- // -------- checkAllInputsAvailable -------- // -------- //
  this.constructor.prototype.checkAllInputsAvailable = async function (targetJob, capacity, externalCheck) {
    return new Promise (async (resolve, reject) => {
      if (targetJob.data.inputProperty.length == 0) resolve(true)
      else if ((capacity == targetJob.data.input.length && targetJob.data.input.length != 0) || externalCheck) {
        let targetEntitySchema = targetJob.data.inputProperty[0].entityschema
        for (let j=0; j<targetJob.data.input.length; j++) {

          //get list of fields which are required by the process but are
          //still not mapped and are available in new data
          let requiredFieldsMapped = await this.areAllRequiredFieldsMapped(targetJob.data.input[j], targetEntitySchema)
          if (!requiredFieldsMapped) {
            resolve(false)
          }
        }
        resolve(true)
      }
      else resolve(false)
    })
  }

  // -------- // -------- createNewJobs -------- // -------- //
  this.constructor.prototype.createNewJobs = async function (targetSchema, targetSchemaIndex, flowInstance, numberOfNewDataAvailable, capacity) {
    return new Promise (async (resolve, reject) => {
      //number of new jobs to be created
      let numberOfNewJobs = capacity ? Math.ceil(numberOfNewDataAvailable / capacity) : 1
      let newJobs = []

      for (let i=0; i < numberOfNewJobs; i++) {
        let newJob = await this.createJob(targetSchema, targetSchemaIndex, flowInstance)
        newJobs.push(newJob)
      }

      resolve(newJobs)
    })
  }

  // -------- // -------- createJobs -------- // -------- //
  this.constructor.prototype.createJob = async function (currentProcess, forProcess, flowInstance) {
    return new Promise (async (resolve, reject) => {
      //--------------- Process Queue Options -----------------
      var jobData = currentProcess
      jobData.input = jobData.input ? jobData.input : []
      jobData.fId = flowInstance.id
      jobData.output = []
      jobData.forProcess = forProcess
      let delay = (currentProcess.start_delay) ? currentProcess.start_delay : 0
      let startAt = (currentProcess.start_at) ? currentProcess.start_at : new Date().getTime()
      let dateEnable =  new Date(new Date().getTime() + 10000)

      try {
        var response = await axios.post(CREATE_URL, {
          "connection": cxnOptions,
          "queue": {
            "name": jobData.type.toLowerCase() + '_worker'
          },
          "options" : {
            "timeout": TIMEOUT,
            "retrymax": 0,
            "manualStatus": 'created',
            'scheduler': {
              'cxnOptions': cxnOptions,
              'table': SCHEDULER_TABLE
            },
            'flowz_table': FLOWZ_TABLE
          },
          "jobs":[jobData]
        })

        response = response.data
        flowInstance.process_log = flowInstance.process_log ? flowInstance.process_log : []
        flowInstance.process_log.push({job: jobData.id, jobType: jobData.type.toLowerCase(), jobId: response[0].id, input: jobData.input, status: 'created', lastModified: new Date()})
        let logAt = flowInstance.process_log.length - 1
        if (logAt != 0) {
          let tmp = await rdash.table(FLOWZ_TABLE).get(flowInstance.id).update({process_log: rdash.row('process_log').append(flowInstance.process_log[logAt])}).run()
        }
        else {
          let tmp = await rdash.table(FLOWZ_TABLE).get(flowInstance.id).update({process_log:flowInstance.process_log}).run()
        }
        resolve(response[0])
      }
      catch (error) {
        pino(PINO_C_OPTION).error(error)
        pino(PINO_DB_OPTION).error(error)
        reject(error)
      }
    })
  }

  // -------- // -------- externalMappingRequired -------- // -------- //
  this.constructor.prototype.externalMappingRequired = async function (targetJob) {
    return new Promise (async (resolve, reject) => {
      let numberOfExternalSchema = (targetJob.data.mapping instanceof Array) ? targetJob.data.mapping.length : 1

      if (numberOfExternalSchema != 0) {
        let sourceCounts = targetJob.data.sourceCount ? Object.values(targetJob.data.sourceCount) : []
        if (sourceCounts.length < numberOfExternalSchema) return false
        else resolve(true)
      }
      else resolve(false)
    })
  }

  // -------- // -------- fetchFromCahce -------- // -------- //
  this.constructor.prototype.fetchFromCahce = async function (fId) {
    return new Promise ((resolve, reject)=>{
      let instanceIndex = _.findIndex(cache, {'id':fId})
      if (instanceIndex != -1) {
        let instance = cache[instanceIndex]
        cache.splice(instanceIndex, 1)
        cache.unshift(instance)
        resolve(instance)
      } else {
        resolve(false)
      }
    })
  }

  // -------- // -------- getCapacity -------- // -------- //
  this.constructor.prototype.getCapacity = async function (targetSchema) {
    return new Promise (async (resolve, reject) => {
      //return max capacity of process from schema of process
      resolve(targetSchema.capacity)
    })
  }

  // -------- // -------- getFillFromStartPoint -------- // -------- //
  this.constructor.prototype.getFillFromStartPoint = async function (targetJobs, capacity, sourceName) {
    return new Promise (async (resolve, reject) => {
      for (let i=0; i<targetJobs.length; i++) {
        let freeSlotsAvailable = await this.getFreeSlotsAvailable(targetJobs[i], capacity, sourceName)
        if (freeSlotsAvailable > 0) {
          resolve(i)
          break
        }
      }
    })
  }

  // -------- // -------- getFlowInstance -------- // -------- //
  this.constructor.prototype.getFlowInstance = async function (fId) {
    return new Promise (async (resolve, reject)=>{
      let instance = await this.fetchFromCahce(fId)
      if (instance) resolve(instance)
      else {
        instance = await rdash.table(FLOWZ_TABLE).get(fId).run()
        cache.unshift(instance)
        if (cache.size > CACHE_SIZE) cache.pop()
        resolve(instance)
      }
    })
  }

  // -------- // -------- getFreeSlotsAvailable -------- // -------- //
  this.constructor.prototype.getFreeSlotsAvailable = async function (targetJob, capacity, sourceName) {
    return new Promise (async (resolve, reject) => {
      targetJob.data.sourceCount = targetJob.data.sourceCount ? targetJob.data.sourceCount : {}
      let sourceCount = targetJob.data.sourceCount[sourceName] ? targetJob.data.sourceCount[sourceName] : 0
      let val = capacity ? capacity - sourceCount : sourceCount != 0 ? 0 : 1
      resolve(val)
    })
  }

  // -------- // -------- getJobFromQueue -------- // -------- //
  this.constructor.prototype.getJobFromQueue = async function (targetSchema, fId, status) {
    return new Promise (async (resolve, reject) => {
      try {
        var response = await axios.post(FIND_URL, {
          "connection": cxnOptions,
          "queue": {
            "name": targetSchema.type.toLowerCase() + '_worker'
          },
          "findVal": { data : { id : targetSchema.id, fId : fId }, status : status }
        })

        response = response.data
        if (response.length > 0) {
          resolve(_.sortBy(response,['dateCreated']))
        } else {
          resolve(false)
        }
      }
      catch (error) {
        pino(PINO_C_OPTION).error(error)
        pino(PINO_DB_OPTION).error(error)
        reject(error)
      }
    })
  }

  // -------- // -------- getJobFromQueueE -------- // -------- //
  this.constructor.prototype.getJobFromQueueE = async function (targetSchema, jobId) {
    return new Promise (async (resolve, reject) => {
      try {
        var response = await axios.post(FIND_URL, {
          "connection": cxnOptions,
          "queue": {
            "name": targetSchema.type.toLowerCase() + '_worker'
          },
          "findVal": { id : jobId }
        })

        response = response.data
        if (response.length > 0) {
          resolve(_.sortBy(response,['dateCreated']))
        } else {
          resolve(false)
        }
      }
      catch (error) {
        pino(PINO_C_OPTION).error(error)
        pino(PINO_DB_OPTION).error(error)
        reject(error)
      }
    })
  }

  // -------- // -------- getMapping -------- // -------- //
  this.constructor.prototype.getMapping = async function (targetSchema, sourceName) {
    return new Promise (async (resolve, reject) => {
      let sourceTargetMapping = _.find(targetSchema.mapping, {'sourceid': sourceName})
      let mapData = sourceTargetMapping ? sourceTargetMapping.MapData : null
      resolve(mapData)
    })
  }

  // -------- // -------- getNextStates -------- // -------- //
  this.constructor.prototype.getNextStates = async function (flowInstance, finishedProcessIndex) {
    return new Promise (async (resolve, reject) => {
      resolve(flowInstance.processList[finishedProcessIndex].target)
    })
  }

  // -------- // -------- getNumberOfAllFreeSlotsAvailable -------- // -------- //
  this.constructor.prototype.getNumberOfAllFreeSlotsAvailable = async function (targetJobs, capacity, sourceName) {
    return new Promise (async (resolve, reject) => {
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

      let val = capacity ? ((targetJobs.length - (k + 1)) * capacity) + j : j
      resolve(val)
    })
  }

  // -------- // -------- getRequiredFieldsSkeleton -------- // -------- //
  this.constructor.prototype.getRequiredFieldsSkeleton = async function (targetEntitySchema) {
    return new Promise (async (resolve, reject) => {
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
      resolve(obj)
    })
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
    return new Promise (async (resolve, reject) => {
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
      resolve('done')
    })
  }

  // -------- // -------- mapOutputsToChildInputs -------- // -------- //
  this.constructor.prototype.mapOutputsToChildInputs = async function (targetJobs, sourceTargetMapping, sourceOutput, capacity, numberOfNewDataAvailable, fillFrom, sourceName, notifyingProcessSchema, outputPropertyIndex) {
    return new Promise (async (resolve, reject) => {
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
                  this.map(sourceTargetMapping[k].producerField, sourceTargetMapping[k].consumerField, sourceOutput[outputsMapped], obj.inputs[outputsMapped], targetJobs[i].data.inputProperty[0].entityschema.entity, notifyingProcessSchema.outputProperty[outputPropertyIndex].entityschema.entity)
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
      resolve('done')
    })
  }

  // -------- // -------- newInstance -------- // -------- //
  this.constructor.prototype.newInstance = async function (flowInstance, fId, next) {
    return new Promise (async (resolve, reject) => {
      try{
        
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
            pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).info({'fId': fId, 'job': startStateId, 'jobId': startJob.id}, 'next job')
            pino(PINO_C_OPTION).info({'fId': fId, 'job': startStateId, 'jobId': startJob.id}, 'next job')
            await this.beginProcess(startJob)
          }
          else {
            pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).warn({'fId': fId, 'job': startStateId, 'jobId': startJob.id}, 'all inputs not available')
            pino(PINO_C_OPTION).warn({'fId': fId, 'job': startStateId, 'jobId': startJob.id}, 'all inputs not available')
          }
        }
        resolve(next(null, 'success'))
      } catch (err) {
        reject(err)
      }
    })
  }

  // -------- // -------- notificationACK -------- // -------- //
  this.constructor.prototype.notificationACK = async function (flowInstance, fId, jobData, next, cxnOptions, qOptions) {
    try {
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
              await this.performTargetOperation(processList, targetProcess, jobData, flowInstance, notifyingProcessSchema, cxnOptions, qOptions)
            }
          }
          else {
            //i.e. no condition for this next state, so call performTargetOperation anyway
            await this.performTargetOperation(processList, targetProcess, jobData, flowInstance, notifyingProcessSchema, cxnOptions, qOptions)
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
    } catch (err) {
      throw err
    }
  }

  // -------- // -------- performExternalOperation -------- // -------- //
  this.constructor.prototype.performExternalOperation = async function (flowInstance, jobData, fId, next) {
    return new Promise (async (resolve, reject) => {
      try {
        if (jobData.input) {
          let targetId = jobData.job //id of the job for which the input was supplied
          let externalInput = (jobData.input instanceof Array) ? jobData.input : [jobData.input] //get external inputs

          //get process object and process index from the processlist
          //for which the input was supplied
          targetSchema = _.find(flowInstance.processList,{'id': targetId})
          targetSchemaIndex = _.findIndex(flowInstance.processList,{'id': targetId})

          let jobId = jobData.jobId
          let requiredStatus = jobData.isMapping ? 'mappingRequired' : 'inputRequired'
          //get job from its respective worker
          let targetJobs = await this.getJobFromQueueE(targetSchema, jobId)

          if (!(_.isEqual(targetJobs[0].data.input,externalInput))) {
            //get array size of external inputs
            let numberOfExternalInputs = externalInput.length

            // get max size of input array that process accepts
            let capacity = await this.getCapacity(targetSchema)

            //get start point from where external inputs mapping will start_start
            let fillFrom = 0

            //map supplied external inputs
            await this.mapExternalInputs(externalInput, targetJobs, numberOfExternalInputs, capacity, fillFrom)

            // let numberOfUpdatedJobs = capacity ? Math.ceil(numberOfExternalInputs / capacity) : 1
            // numberOfUpdatedJobs = targetJobs.length < numberOfUpdatedJobs ? targetJobs.length : targetJobs ? numberOfUpdatedJobs : 0

            //for each updated job, check if all inputs required by the process are available or not
            //if all inputs are available, begin the target process
            //else update the target process in its respective job queue to latest mapping
            // for (let i=fillFrom; i<numberOfUpdatedJobs; i++) {

              //get boolean to check if all inputs needed by the process to start are now all available or not
              // let inputAvailability = await this.areAllInputsAvailable(targetJobs[i], targetSchemaIndex, fId, true)
              let inputAvailability = await this.areAllInputsAvailable(targetJobs[0], targetSchemaIndex, fId, true)

              if (inputAvailability) {
                //if all inputs are available, update the latest mapping done and begin the process
                //i.e. change status of the job for that process in it's respective worker queue to `waiting`
                pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).info({'fId': jobData.fId, 'job': targetSchema.id, 'jobId': targetJobs[0].id}, 'next job')
                pino(PINO_C_OPTION).info({'fId': jobData.fId, 'job': targetSchema.id, 'jobId': targetJobs[0].id}, 'next job')
                // await this.beginProcess(targetJobs[i])
                await this.beginProcess(targetJobs[0])
              }
              else {
                //i.e. all inputs are still not available so just update the latest mapping done
                //(it's status in it's respective worker queue will not be changed)
                pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).warn({'fId': jobData.fId, 'job': targetSchema.id, 'jobId': targetJobs[0].id}, 'all inputs not available')
                pino(PINO_C_OPTION).warn({'fId': jobData.fId, 'job': targetSchema.id, 'jobId': targetJobs[0].id}, 'all inputs not available')
                // let tmp = await this.updateProcess(targetJobs[i])
              }
            // }
          }
          resolve(next(null, 'success'))
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  // -------- // -------- performTargetOperation -------- // -------- //
  this.constructor.prototype.performTargetOperation = async function (processList, target, jobData, flowInstance, notifyingProcessSchema, cxnOptions, qOptions) {
    return new Promise (async (resolve, reject) => {
      let targetId = target.id
      let fId = flowInstance.id //get database id of flowInstance to which it belongs
      let targetSchema = _.find(processList,{'id': targetId}) //get process block from processList based on targetId
      let targetSchemaIndex = _.findIndex(processList,{'id': targetId}) //get index of process block from processList based on targetId
      //if output of previous data is single object, convert it to array
      let sourceOutput = (jobData.output instanceof Array) ? jobData.output : target.outputid ? jobData.output[target.outputid.toLowerCase()] : [jobData.output]
      if (sourceOutput || targetSchema.isProcessTask) {
        if (targetSchema.isProcessTask) {
          await this.updateLog(targetSchema, 'running', null, true, fId)
          let type = targetSchema.type.toLowerCase() + '_worker'
          targetSchema = JSON.stringify(targetSchema)
          c_options = JSON.stringify(cxnOptions)
          q_options = JSON.stringify(qOptions)
          let n = cp.fork(`${__dirname}/${'process.js'}`, [type, PROCESS_URL, targetSchema, targetSchemaIndex, fId, c_options, q_options])
          await rdash.table(RUNTIME_PROCESS_TABLE).insert({options: [type, PROCESS_URL, targetSchema, targetSchemaIndex, fId, c_options, q_options], created: new Date()}).run()
        }
        else {
          let outputPropertyIndex = target.outputid ? _.findIndex(notifyingProcessSchema.outputProperty, {id: target.outputid}) : 0
          let sourceName = jobData.currentProcess //variable to store id of process which got completed

          //get all child jobs from the respective child type queue whose status is `parameterMapping`
          let targetJobs = await this.getJobFromQueue(targetSchema, fId, 'created')
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
              await this.beginProcess(targetJobs[i])
            }
            else {
              //i.e. all inputs are still not available so just update the latest mapping done
              //(it's status in it's respective worker queue will not be changed)
              var mappingRequired = capacity ? false : this.externalMappingRequired(targetJobs[i])
              if (mappingRequired) {
                pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).warn({'fId': fId, 'jobId': targetId}, 'mapping required')
                pino(PINO_C_OPTION).warn({'fId': fId, 'jobId': targetId}, 'mapping required')
              }
              else {
                pino(PINO_DB_OPTION,fs.createWriteStream('./logs')).warn({'fId': fId, 'job': targetId, 'jobId': targetJobs[i].id}, 'all inputs not available')
                pino(PINO_C_OPTION).warn({'fId': fId, 'job': targetId, 'jobId': targetJobs[i].id}, 'all inputs not available')
              }
              // let tmp = await this.updateProcess(targetJobs[i])
            }
          }
        }
      }
      resolve('success')
    })
  }

  // -------- // -------- rerunProcess -------- // -------- //
  async function rerunProcess () {
    return new Promise (async (resolve, reject) => {
      try {
        let tableList = await rdash.tableList().run()
        if (!(_.includes(tableList, RUNTIME_PROCESS_TABLE))) {
          await rdash.tableCreate(RUNTIME_PROCESS_TABLE).run()
        }
        let previousProcess = await rdash.table(RUNTIME_PROCESS_TABLE).filter(rdash.row('created').gt(new Date(new Date().getTime() - 86400000))).run()
        for (let i=0; i<previousProcess.length; i++) {
          let n = cp.fork(`${__dirname}/${'process.js'}`, previousProcess[i].options)
        }
        resolve('done')
      }catch (err) {
        reject(err)
      }
    })
  }

  // -------- // -------- updateLog -------- // -------- //
  this.constructor.prototype.updateLog = async function (targetJob, status, requiredFieldsSkeleton, isProcess, fId) {
    return new Promise (async (resolve, reject) => {
      if (isProcess) {
        await rdash.table(FLOWZ_TABLE).get(fId).update({process_log: rdash.row('process_log').append({job: targetJob.id, jobType: targetJob.type.toLowerCase(), status: status, lastModified: new Date()})}).run()
        resolve('done')
      } else {
        let data = targetJob.data
        let sourceCount = data.sourceCount ? data.sourceCount : []
        if (requiredFieldsSkeleton) {
          await rdash.table(FLOWZ_TABLE).get(data.fId).update({process_log: rdash.row('process_log').append({job: data.id, jobType: data.type.toLowerCase(), jobId: targetJob.id, input: data.input, sourceCount: sourceCount, status: status, requiredFields: requiredFieldsSkeleton, lastModified: new Date()})}).run()
          resolve('done')
        }
        else {
          await rdash.table(FLOWZ_TABLE).get(data.fId).update({process_log: rdash.row('process_log').append({job: data.id, jobType: data.type.toLowerCase(), jobId: targetJob.id, input: data.input, sourceCount: sourceCount, status: status, lastModified: new Date()})}).run()
          resolve('done')
        }
      }
    })
  }

  // -------- // -------- updateProcess -------- // -------- //
  this.constructor.prototype.updateProcess = async function (childJob, status) {
    return new Promise (async (resolve, reject) => {
      try {
        var response = await axios.post(UPDATE_URL, {
          "connection": cxnOptions,
          "queue": {
            "name": childJob.data.type.toLowerCase() + '_worker'
          },
          "findVal": {
            "id": childJob.id
          },
          "data": childJob.data,
          "options": {
            "status": status
          }
        })
        resolve('done')
      }
      catch (error) {
        pino(PINO_C_OPTION).error(error)
        pino(PINO_DB_OPTION).error(error)
        reject(error)
      }
    })
  }

  // -------- // -------- validate -------- // -------- //
  this.constructor.prototype.validate = async function (req, tc) {
    return new Promise (async (resolve, reject) => {
      if (req instanceof Array) {
        let testField = req[0]
        for (let i=0; i<tc.length; i++) {
          if (!await this.validate(testField, tc[i])) resolve(false)
        }
      }
      else {
        for (field in req) {
          if (req[field] instanceof Array || typeof req[field] == 'object') {
            let tmpResult =  tc[field] ? await this.validate(req[field], tc[field]) : false
            if (!tmpResult) resolve(false)
          }
          else if (!tc[field] && tc[field] != false) resolve(false)
        }
      }
      resolve(true)
    })
  }

  // -------- // -------- verifyCondition -------- // -------- //
  this.constructor.prototype.verifyCondition = async function (conditions, input, output) {
    return new Promise (async (resolve, reject) => {
      for (let i=0; i<conditions.length; i++) {
        let condition = conditions[i]
        if (!eval(condition)) {
          resolve(false)
        }
      }
      resolve(true)
    })
  }
}
