var common = require('./common')
const config = require('config')
const _ = require('lodash')
var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
const cxnOptions = config.get('cxnOptions')
const symmetricWorker = config.get('symmetricWorker')
const rdash = require('rethinkdbdash')(cxnOptions)
const pino = require('pino')

const waitingThreshold = config.get('waitingThreshold')
const increaseWorker = config.get('increaseWorker')
const maxWorker = config.get('maxWorker')
const PINO = config.get('pino')
let wCount = 1
let registeredJobTypeQueueObj = {}     // register job type queue object
var connected = false

checkTableExistsOrNot(symmetricWorker.table)
  .then(res => {
    pino(PINO).info(res)
    connected=true
  })

process.setMaxListeners(0)
let socketObj = io.of('/execute-worker')
socketObj.on('connection', function (socket) {
  pino(PINO).info('socket connected')
})

server.listen(symmetricWorker.port)

function checkTableExistsOrNot (table) {
  return new Promise((resolve, reject) => {
    rdash.tableList().run().then(function (tableNames) {
      if (_.includes(tableNames, table)) {
        resolve('table already exists')
      } else {
        rdash.tableCreate(table).run()
        resolve('table created')
      }
    })
  })
}

function deleteDataJobType (table, jobTyped) {
  return new Promise(async (resolve, reject) => {
    await rdash.table(table)
    .filter(rdash.row('jobType').eq(jobTyped))
    .delete()
    .run()
    .then(function (result) {
      resolve(null)
    })
    .error(function (err) {
      reject(null)
    })
  })
}

function generateQueueObjectByJobTypeWithOutSave (jobType, options) {
  return new Promise((resolve, reject) => {
    if (registeredJobTypeQueueObj[jobType]) {
      resolve('JobType registered successfully')
    } else {
      common.getJobQueue(options).then(result => {
        try {
          registeredJobTypeQueueObj[jobType] = {'qObj': result.q, 'options': options}
          resolve('JobType registered successfully')
        } catch (e) {
          reject(e)
        }
      }).catch(e => reject(e))
    }
  })
}

function generateQueueObjectByJobTypeWithSaveToDB (jobType, options) {
  return new Promise((resolve, reject) => {
    if (registeredJobTypeQueueObj[jobType]) {
      resolve('JobType already registered')
    } else {
      common.getJobQueue(options).then(result => {
        try {
          let registeredJobType = {
            jobType: jobType,
            options: options
          }
          saveToRethinkDB(symmetricWorker.table, registeredJobType)
          registeredJobTypeQueueObj[jobType] = {'qObj': result.q, 'options': options}
          resolve('JobType successfully registered')
        } catch (e) {
          reject(e)
        }
      }).catch(e => reject(e))
    }
  })
}

function getAllJobType (table) {
  return new Promise(async (resolve, reject) => {
    await rdash.table(table)
    .run()
    .then(function (result) {
      resolve(result)
    })
    .error(function (err) {
      reject(err)
    })
  })
}

function getDataJobType (table, jobTyped) {
  return new Promise(async (resolve, reject) => {
    await rdash.table(table)
    .filter(rdash.row('jobType').eq(jobTyped))
    .run()
    .then(function (result) {
      if (result.length > 0) {
        resolve(result[0])
      } else {
        resolve(result)
      }
    })
    .error(function (err) {
      reject(err)
    })
  })
}

async function getSummary () {
  try {
    if (Object.keys(registeredJobTypeQueueObj).length > 0) {
      pino(PINO).info('Summary Start')
      for (var jobType in registeredJobTypeQueueObj) {
        let objQ = registeredJobTypeQueueObj[jobType].qObj
        pino(PINO).info('JobType', jobType)

        let concurrency = objQ.concurrency
        let summary = await objQ.summary().catch(e => pino(PINO).error(e))
        pino(PINO).info(summary)

        let sCreated = summary.created ? summary.created : 0
        let denominator = (summary.total - (summary.active + summary.completed + summary.cancelled + summary.failed + summary.terminated + sCreated))
        let waitingRatio = denominator != 0 ? (summary.waiting) / denominator : 0
        if (waitingRatio > waitingThreshold && wCount < maxWorker ) {
          let startWorkers = parseInt(((100 * (waitingRatio - waitingThreshold)) * increaseWorker) / 100)
          pino(PINO).info("before emit")
          socketObj.emit('worker', {'jobType': jobType, 'needWorker': startWorkers, 'options': registeredJobTypeQueueObj[jobType].options})
        }
      }
      pino(PINO).info('Summary End')
    }
  } catch (e) {
    pino(PINO).error(e)
  }
  setTimeout(() => { getSummary() }, 5000)
}

function saveToRethinkDB (table, data) {
  return new Promise(async(resolve, reject) => {
    let result = await getDataJobType(table, data.jobType)
    let messageData = data
    let saveData
    if (result.id === undefined) {
      saveData = rdash.table(table).insert(messageData)
    } else {
      saveData = rdash.table(table).filter({id: result.id}).update(messageData)
    }
    saveData.run()
    .then(function (result) {
      pino(PINO).info('data inserted')
      resolve(result)
    })
    .error(function (err) {
      reject(err)
    })
  })
}

async function startAllRegisteredJobType () {
  if(!connected) {
    setTimeout(() => { startAllRegisteredJobType() }, 1000)
  } else {
    let jobTypes = await getAllJobType(symmetricWorker.table)
    for (var i = 0; i < jobTypes.length; i++) {
      await generateQueueObjectByJobTypeWithOutSave(jobTypes[i].jobType, jobTypes[i].options)
    }
    getSummary()
  }
}

app.put('/register-jobtype/:jobtype', async function (req, res) {
  try {
    let newConnection = _.extend({'connection':cxnOptions},{'queue': {'name': req.params.jobtype}})
    generateQueueObjectByJobTypeWithSaveToDB(req.params.jobtype, newConnection)
      .then(result => { res.send(result) })
      .catch(err => { res.send(err) })
  } catch (e) {
    return res.status(400).send('JobType not registered')
  }
})

app.delete('/register-jobtype/:jobtype', async function (req, res) {
  try {
    if (registeredJobTypeQueueObj[req.params.jobtype] !== undefined) {
      delete registeredJobTypeQueueObj[req.params.jobtype]
      deleteDataJobType(symmetricWorker.table, req.params.jobtype)
        .then(result => { res.send('JobType successfully unregister') })
        .catch(err => { res.send(res) })
    } else {
      res.send('JobType not found')
    }
  } catch (e) {
    pino(PINO).error(e)
    return res.status(400).send('JobType not found')
  }
})

app.post('/register-jobtype/:jobtype', async function (req, res) {
  try {
    let newConnection = _.extend({connection: defaultConnection}, {
      connection: req.body.connection
    })
    generateQueueObjectByJobTypeWithSaveToDB(req.param.jobtype, newConnection)
      .then(result => { res.send(result) })
      .catch(err => { res.send(err) })
  } catch (e) {
    pino(PINO).error(e)
    return res.status(400).send('JobType not registered')
  }
})

startAllRegisteredJobType()
