 // <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js"></script>
 // <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.10/lodash.min.js"></script>
import axios from 'axios'
import _ from 'lodash'

let options = {
  flowzApiURL: 'https://api.flowzcluster.tk/eng/flowz/',
  cacheAPIURL: 1000 * 60
}
let flowCache = []

export const deepRecord = {
  addRecord: async function (dpClient, instanceId, recordName, payload) {
    return new Promise(async (resolve, reject) => {
      try {
        let id = instanceId + recordName + '/' + dpClient.getUid()
        let recordObj = dpClient.record.getRecord(id)
        recordObj.whenReady((record) => {
          record.set(payload)
          resolve({recordId: id, recordObj: record})
        })
      } catch (err) {
        reject(err)
      }
    })
  },
  getRecord: async function (dpClient, recordName, callback) {
    dpClient.record.snapshot(recordName, callback)
  },
  recordSubscribe: async function (dpClient, recordName, callback) {
    return new Promise(async (resolve, reject) => {
      try {
        let recordObj = dpClient.record.getRecord(recordName)
        recordObj.subscribe(callback)
      } catch (err) {
        reject(err)
      }
    })
  },
  getRecordObject: async function (dpClient, recordName) {
    return new Promise(async (resolve, reject) => {
      try {
        let recordObj = dpClient.record.getRecord(recordName)
        recordObj.whenReady((record) => {
          resolve(record)
        })
      } catch (err) {
        reject(err)
      }
    })
  },
  // removeRecord: async function (dpClient, recordName, recordObj) {
  //   dpClient.record.getRecord( recordName ).delete();
  //   let listName = recordName.substring(0,recordName.indexOf('/'))
  //   dpClient.record.getList(recordName).removeEntry(id);
  // },
  getFlow: async function (instanceId) {
    if (flowCache[instanceId] !== undefined) {
      return flowCache[instanceId]
    }
    let orignalInstanceId = await this.replaceAll(instanceId, '_', '-')
    let flowData = await axios.get(options.flowzApiURL + orignalInstanceId + '?$select[]=json')
    flowCache[instanceId] = {
      timeStamp: new Date(),
      dataObj: flowData.data.json
    }
    return flowCache[instanceId]
  },
  getNextTraget: async function (instanceId, targetId) {
    let flowData = await this.getFlow(instanceId)
    flowData = flowData.dataObj
    let targetObj = _.find(flowData.processList, {'id': targetId})
    if (targetObj.type === 'start' ||
        targetObj.type === 'endevent' ||
        targetObj.type === 'intermediatethrowevent') {
      return targetObj
    }
    if (targetObj.inputProperty.length === 0) {
      targetObj = this.getNextTraget(instanceId, targetObj.target[0].id)
    }
    return targetObj
  },
  getCurrentTraget: async function (instanceId, targetId) {
    let flowData = await this.getFlow(instanceId)
    flowData = flowData.dataObj
    let targetObj = _.find(flowData.processList, {'id': targetId})
    return targetObj
  },
  replaceAll: function replaceAll (str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace)
  },
  startInstance: async function (dpClient, instanceId) {
    return new Promise(async (resolve, reject) => {
      instanceId = await this.replaceAll(instanceId, '-', '_')
      let flowData = await this.getFlow(instanceId)
      flowData = flowData.dataObj
      let startObj = _.find(flowData.processList, {'type': 'start'})
      let nextTargetObj = await this.getNextTraget(instanceId, startObj.target[0].id)
      let payload = {
        instanceId,
        'currentStatus': nextTargetObj.id,
        stageReference: [],
        'mainStatus': 'inprocess'
      }
      let instanceListName = instanceId + 'List'
      let returnObj = await this.addRecord(dpClient, instanceId, '', payload).catch((err) => { console.log(err) })
      let instanceListObj = dpClient.record.getList(instanceListName)
      instanceListObj.addEntry(returnObj.recordId)
      resolve({instanceListName, instanceListObj, recordId: returnObj.recordId, recordObj: returnObj.recordObj})
    })
  },
  setNextStage: async function (dpClient, instanceRecordId, stageRecordId) {
    return new Promise(async (resolve, reject) => {
      let getRecordData = await this.getRecordObject(dpClient, instanceRecordId)
      let instanceId = getRecordData.get('instanceId')
      let currentStatus = getRecordData.get('currentStatus')
      let currentTargetObj = await this.getCurrentTraget(instanceId, currentStatus)
      let nextTargetObj = await this.getNextTraget(instanceId, currentTargetObj.target[0].id)
      let stageReference = getRecordData.get('stageReference')
      stageReference.push({StageName: currentStatus, stageRecordId})

      let updateInstance = getRecordData.get()
      updateInstance.currentStatus = nextTargetObj.id
      updateInstance.stageReference = stageReference
      if (nextTargetObj.type === 'endevent') {
        updateInstance.mainStatus = 'completed'
      }
      getRecordData.set(updateInstance)
      resolve('completed')
    })
  },
  instanceStageSubmit: async function (dpClient, instanceRecordId, payload) {
    return new Promise(async (resolve, reject) => {
      let getRecordData = await this.getRecordObject(dpClient, instanceRecordId)
      let instanceId = getRecordData.get('instanceId')
      let StageName = getRecordData.get('currentStatus')
      let stageListName = StageName + 'List'
      payload[instanceId] = instanceId
      let returnObj = await this.addRecord(dpClient, instanceId, StageName, payload).catch((err) => { console.log(err) })
      let stageListObj = dpClient.record.getList(stageListName)
      stageListObj.addEntry(returnObj.recordId)
      await this.setNextStage(dpClient, instanceRecordId, returnObj.recordId)
      resolve({stageListName, stageListObj, recordId: returnObj.recordId, recordObj: returnObj.recordObj})
    })
  }
}
