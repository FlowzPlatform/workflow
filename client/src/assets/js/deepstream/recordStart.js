const deepstream = require('deepstream.io-client-js')
const client = deepstream('ws://167.99.233.211:6020').login()
const DeepRecord = require('./deepRecord')

let id = 0

async function startFlow () {
  let instanceId = '39c53741-ec14-4ceb-a9db-97d7066cd424'
  // ==================Flow initiated==============================
  let instanceObj = await DeepRecord.startInstance(client, instanceId)
  instanceObj.recordObj.subscribe((data) => {
  })
  // // ==================OrderEntry==============================
  // let StageName = 'OrderEntry'
  // payload = {
  //   'firstName': 'Test',
  //   "lastName": "Xyz",
  //   "po_number": Math.random()
  // };
  // let returnObj = await DeepRecord.instanceStageSubmit(client, instanceName, StageName, payload);
  // instanceObj.recordObj.set('currentStatus','ArtWork')
  // // ==================OrderEntry==============================
  // // ==================ArtWork==============================
  // StageName = 'ArtWork'
  // payload = {
  //   'firstName': 'Test',
  //   "lastName": "Xyz",
  //   "po_number": Math.random(),
  //   "ArtFile":"Art File uploaded"
  // };
  // returnObj = await DeepRecord.instanceStageSubmit(client, instanceName, StageName, payload);
  // instanceObj.recordObj.set('currentStatus','Proof')
  // // ================================================
  // // ==================Proof==============================
  // StageName = 'Proof'
  // payload = {
  //   'firstName': 'Test',
  //   "lastName": "Xyz",
  //   "po_number": Math.random(),
  //   "ArtFile":"Art File uploaded",
  //   "moveTo": 'Print'
  // };
  // returnObj = await DeepRecord.instanceStageSubmit(client, instanceName, StageName, payload);
  // instanceObj.recordObj.set('currentStatus','Print')
  // // ================================================
  // // ==================Proof==============================
  // StageName = 'Print'
  // payload = {
  //   'firstName': 'Test',
  //   "lastName": "Xyz",
  //   "po_number": Math.random(),
  //   "ArtFile":"Art File uploaded",
  //   "moveTo": 'completed'
  // };
  // returnObj = await DeepRecord.instanceStageSubmit(client, instanceName, StageName, payload);
  // instanceObj.recordObj.set('currentStatus','completed')
  // // ================================================
  // // ==================completed==============================
  // StageName = 'Print'
  // payload = {
  //   'firstName': 'Test',
  //   "lastName": "Xyz",
  //   "po_number": Math.random(),
  //   "ArtFile":"Art File uploaded",
  //   "moveTo": 'End'
  // };
  // returnObj = await DeepRecord.instanceStageSubmit(client, instanceName, StageName, payload);
  // instanceObj.recordObj.set('currentStatus','End')
  // // ================================================
}

startFlow()

// setInterval(() => {
//   startFlow()
// },20)
//
// setInterval(() => {
//   startFlow()
// },20)
