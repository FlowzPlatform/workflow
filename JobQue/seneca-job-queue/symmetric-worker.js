var common = require('./common')
const config = require('./config')
const _ = require('lodash')
var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
const cxnOptions = config.cxnOptions
const symmetricWorker = config.symmetricWorker
const rethinkdbdash = require('rethinkdbdash')
const rdash = rethinkdbdash(cxnOptions)
const pino = require('pino')
const cors = require('cors')
const waitingThreshold = config.waitingThreshold
const increaseWorker = config.increaseWorker
const maxWorker = config.maxWorker
const PINO = config.pino
const r = require('rethinkdb')
let wCount = 1
let registeredJobTypeQueueObj = {} // register job type queue object
let deadQueueObj = {}
var connected = false

checkTableExistsOrNot(symmetricWorker.table)
  .then(res => {
    pino(PINO).info(res)
    connected = true
  })

app.use(cors())
process.setMaxListeners(0)
let socketObj = io.of('/execute-worker')
socketObj.on('connection', function (socket) {
  pino(PINO).info('socket connected')
})

server.listen(symmetricWorker.port)

function checkTableExistsOrNot(table) {
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

function deleteDataJobType(table, jobType) {
  return new Promise(async(resolve, reject) => {
    await rdash.table(table)
      .filter(rdash.row('jobType').eq(jobType))
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

function generateQueueObjectByJobTypeWithOutSave(jobDetails) {
  return new Promise((resolve, reject) => {
    let jobType = jobDetails.jobType
    let options = jobDetails.options
      //let key = jobDetails.jobKey
    let key = options.connection.host + ':' + options.connection.port + ':' + options.connection.db + ':' + jobType
    if (registeredJobTypeQueueObj[key]) {
      resolve('JobType registered successfully')
    } else {
      common.getJobQueue(options).then(result => {
        try {
          registeredJobTypeQueueObj[key] = { 'qObj': result.q, 'options': options, 'jobType': jobType }
          resolve('JobType registered successfully')
        } catch (e) {
          reject(e)
        }
      }).catch(e => reject(e))
    }
  })
}

function generateQueueObjectByJobTypeWithSaveToDB(jobType, options) {
  return new Promise((resolve, reject) => {
    let connection = options.connection
    let key = connection.host+':'+connection.port+':'+connection.db+':'+jobType
    if (registeredJobTypeQueueObj[key]) {
      resolve('JobType already registered')
    } else {
      common.getJobQueue(options).then(async result => {
        try {
          let registeredJobType = {
            jobType: jobType,
            options: options,
            jobKey: key
          }
          await saveToRethinkDB(symmetricWorker.table, registeredJobType)
          registeredJobTypeQueueObj[key] = { 'qObj': result.q, 'options': options, 'jobType': jobType }
          resolve('JobType successfully registered')
        } catch (e) {
          reject(e)
        }
      }).catch(e => reject(e))
    }
  })
}

function getAllJobType(table) {
  return new Promise(async(resolve, reject) => {
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

async function getCount(cOptions, jobType) {
  return new Promise((resolve, reject) => {
    r.connect(cOptions, function (err, conn) {
      if (err) {
        resolve(0)
      } else {
        r.table(jobType).filter((r.row('status').eq('waiting')).and(r.row('dateEnable').gt(r.now()))).count().run(conn, function (err, result) {
          if (err) resolve(0)
          resolve(result)
        })
      }
    })
  })
}

function getDataJobType(table, jobType) {
  return new Promise(async(resolve, reject) => {
    await rdash.table(table)
      .filter(rdash.row('jobType').eq(jobType))
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

async function getSummary() {
  try {
    for (let jKey in registeredJobTypeQueueObj) {
      let cOptions = registeredJobTypeQueueObj[jKey].options.connection
      try {
        // let rSummary = rethinkdbdash(cOptions)
        // rSummary.getPoolMaster().drain()
        let objQ = registeredJobTypeQueueObj[jKey].qObj
        let jobType = registeredJobTypeQueueObj[jKey].jobType

        let concurrency = objQ.concurrency
        let summary = await objQ.summary()
        pino(PINO).info('\n' + 'job-type : ' + jobType + ' | host : ' + cOptions.host + ' | port : ' + cOptions.port + ' | db : ' + cOptions.db + '\n\x1b[33m' + JSON.stringify(summary) + '\x1b[0m' + '\n')

        let sWaiting = await getCount(cOptions, jobType)
          // let sCreated = summary.created ? summary.created : 0
          // let sIR = summary.inputRequired ? summary.inputRequired : 0
          // let sMR = summary.mappingRequired ? summary.mappingRequired : 0
          // let denominator = (summary.total - (summary.active + summary.completed + summary.cancelled + summary.failed + summary.terminated + sCreated + sIR + sMR))
          // let waitingRatio = denominator != 0 ? (summary.waiting - sWaiting) / denominator : 0
          // pino(PINO).warn('waiting-ratio : '+waitingRatio)
        let waitingJobs = summary.waiting - sWaiting
        if (waitingJobs >= 1) {
          pino(PINO).info(jobType + " worker required")
          socketObj.emit('worker', { 'jobType': jobType, 'options': registeredJobTypeQueueObj[jKey].options })
        }
      } catch (err) {
        deadQueueObj[jKey] = registeredJobTypeQueueObj[jKey]
        delete registeredJobTypeQueueObj[jKey]
        pino(PINO).error('key : ' + jKey + ' connection error')
      }
    }
  } catch (e) {
    pino(PINO).error(e)
  }
  setTimeout(() => { getSummary() }, 10000)
}

async function saveToRethinkDB(table, data) {
  return new Promise(async(resolve, reject) => {
    let result = await getDataJobType(table, data.jobType)
    let messageData = data
    let saveData
    if (result.id === undefined) {
      saveData = rdash.table(table).insert(messageData)
    } else {
      saveData = rdash.table(table).filter({ id: result.id }).update(messageData)
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

async function startAllRegisteredJobType() {
  if (!connected) {
    setTimeout(() => { startAllRegisteredJobType() }, 1000)
  } else {
    let jobTypes = await getAllJobType(symmetricWorker.table)
    for (var i = 0; i < jobTypes.length; i++) {
      await generateQueueObjectByJobTypeWithOutSave(jobTypes[i])
    }
    getSummary()
  }
}

app.put('/register-jobtype/:jobtype', async function (req, res) {
  try {
    let cOption = cxnOptions
    if (cOption.authKey && cOption.ssl) {
      if (cOption.user) delete cOption.user
      if (cOption.password) delete cOption.password
    } else {
      if (cOption.authKey) delete cOption.authKey
      if (cOption.ssl) delete cOption.ssl
    }
    let newConnection = _.extend({ 'connection': cOption }, { 'queue': { 'name': req.params.jobtype } })
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
    let newConnection = _.extend({ connection: defaultConnection }, {
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
