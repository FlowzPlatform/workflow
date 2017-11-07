const config = require('config')
const _ = require('lodash')
const cxnOptions = config.get('cxnOptions')
const rdash = require('rethinkdbdash')(cxnOptions)
const registerWorker = config.get('registerWorker')
var app = require('express')()
const pino = require('pino')
const PINO = config.get('pino')
const fileUpload = require('express-fileupload')

app.use(fileUpload())

checkTableExistsOrNot(registerWorker.table)
  .then(res => pino(PINO).info(res))

app.get('/download/:jobtype', async function (req, res) {
  let result = await getDataJobType(registerWorker.table, req.params.jobtype)
  if (result.id === undefined) {
    return res.status(400).send('No worker registered.')
  }
  res.setHeader('Content-disposition', 'attachment; filename='+result.fileInfo.name);
  res.setHeader('Content-type', result.fileInfo.mimetype);
  res.write(result.fileInfo.data, 'binary');
  res.end();
})

app.get('/job-module/:jobtype', async function (req, res) {
  let result = await getDataJobType(registerWorker.table, req.params.jobtype)
  if (result.id === undefined) {
    return res.status(400).send('No worker registered.')
  }
  res.send(result.jobProcess)
})

app.post('/upload', async function (req, res) {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.')
  }
  let sampleFile = req.files.sampleFile
  let workerData = {
    jobType: req.body.jobtype,
    fileInfo: {
      name: sampleFile.name,
      data: sampleFile.data,
      encoding: sampleFile.encoding,
      mimetype: sampleFile.mimetype
    }
  }

  saveToRethinkDB(registerWorker.table, workerData)
  .then(result => {
    res.send('Worker Process registered!')
  })
  .catch(err => {
    return res.status(500).send(err)
  })
})

app.post('/upload-worker-process', async function (req, res) {
  let workerData = {
    jobType: req.body.jobtype,
    jobProcess: req.body.jobprocess
  }

  saveToRethinkDB(registerWorker.table, workerData)
  .then(result => {
    res.send('Worker Process registered!')
  })
  .catch(err => {
    return res.status(500).send(err)
  })
})

app.post('/check', async function (req, res) {
  console.log(req.body)
  res.send(req.body)
})

app.listen(registerWorker.port)

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
