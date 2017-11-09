const Queue = require('rethinkdb-job-queue')
const config = require('config')
const pino = require('pino')
const PINO = config.get('pino')
const pluginSubscriptionCreate = config.get('plugins.subscriptionCreatePattern')
const pluginCreate = config.get('plugins.createPattern')
const pluginFind = config.get('plugins.findPattern')
const pluginQueue = config.get('plugins.queuePattern')
const pluginUpdate = config.get('plugins.updatePattern')

const dbConfig = config.get('cxnOptions')
const qConfig = config.get('defaultQueue')
const subsConfig = config.get('defaultSubscription')

const qCreateOption = config.get('defaultCreateJob')

const defaultOption = {
  connection: dbConfig,
  queue: qConfig,
  options: qCreateOption,
  subscription: subsConfig
}

module.exports = function job (options) {
  let rethinkDBInfo, newoptions
  let plugin = this
  let priority = ['lowest', 'low', 'normal', 'medium', 'high', 'highest']
  let allowedStatus = ['created']

  options = mergeOptions(defaultOption, options)

  plugin.add(pluginCreate, async function (msg, response) {
    try {

      // validate parameter
      let validParamErr
      [validParamErr, msg] = validateRequestBody(msg)
      if (validParamErr) {
        response(validParamErr)
        return false
      }

      // if any option pass as parameter it will create jobs
      let newoption = {
        queue: msg.queue,
        connection: msg.connection,
        options: msg.options
      }

      // Merge Options
      newoptions = mergeOptions(options, newoption)

      await createRethinkJobQueue(msg)
        .then(result => {
          // add to subscription queue when its enable
          if (options.subscription.enable === true) {
            jData = Object.assign({}, result, rethinkDBInfo)
            addToScubscriptionQueue(plugin, jData)
          }
          result.connectionInfo = rethinkDBInfo
          response(null, result)
        })
        .catch(err => {
          err.connectionInfo = rethinkDBInfo
          response(err)
        })
    } catch (err) {
      response(err)
    }
  })

  plugin.add(pluginQueue, async function (msg, response) {
    try {

      // validate parameter
      let validParamErr
      [validParamErr, msg] = validateRequestBody(msg)
      if (validParamErr) {
        response(validParamErr)
        return false
      }

      // if any option pass as parameter it will create jobs
      let newoption = {
        queue: msg.queue,
        connection: msg.connection,
        options: msg.options
      }

      // Merge Options
      newoptions = mergeOptions(options, newoption)

      let queueObj = await createJobQueue(newoptions.connection, newoptions.queue)
      queueObj.on('error', (err) => {
        // err object is system error
        response(customError(err))
      })
      response({q:queueObj})
    } catch (err) {
      response(err)
    }
  })

  plugin.add(pluginFind, async function (msg, response) {
    try {

      // validate parameter
      let validParamErr
      [validParamErr, msg] = validateRequestBody(msg)
      if (validParamErr) {
        response(validParamErr)
        return false
      }

      // if any option pass as parameter it will create jobs
      let newoption = {
        queue: msg.queue,
        connection: msg.connection,
        options: msg.options
      }

      // Merge Options
      newoptions = mergeOptions(options, newoption)

      await findRethinkJob(msg)
      .then(result => {
        result.connectionInfo = rethinkDBInfo
        response(null, result)
      })
      .catch(err => {
        err.connectionInfo = rethinkDBInfo
        response(err)
      })
    } catch (err) {
      response(err)
    }
  })

  plugin.add(pluginUpdate, async function (msg, response) {
    try {
      // validate parameter
      let validParamErr
      [validParamErr, msg] = validateRequestBody(msg)
      if (validParamErr) {
        response(validParamErr)
        return false
      }

      // if any option pass as parameter it will create jobs
      let newoption = {
        queue: msg.queue,
        connection: msg.connection,
        options: msg.options
      }

      // Merge Options
      newoptions = mergeOptions(options, newoption)

      await updateRethinkJob(msg)
        .then(result => {
          result.connectionInfo = rethinkDBInfo
          response(null, result)
        })
        .catch(err => {
          err.connectionInfo = rethinkDBInfo
          response(err)
        })
    } catch (err) {
      response(err)
    }
  })

  async function addJob (queueObj, job) {
    return new Promise(async (resolve, reject) => {
      try {
        await queueObj.addJob(job)
        .then(async result => {
          for (i=0;i<result.length;i++) {
            if (result[i].manualStatus && allowedStatus.includes(result[i].manualStatus)) {
              result[i].status = result[i].manualStatus
              delete result[i].manualStatus
              await result[i].update()
            } else if (result[i].manualStatus) {
              delete result[i].manualStatus
            }
          }
          result = result.map(function (a) { delete a.q; return a })
          resolve(result)
        })
        .catch(err => {
          reject(err)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  function addToScubscriptionQueue (plugin, JobData) {
    // plugin.use('subscription').act(pluginSubscriptionCreate, JobData, function (err, Result) {
    //   if (err) {
    //     return false
    //   } else {
    //     return true
    //   }
    // })
  }

  async function createJob (queueObj, QData) {
    try {
      delete QData.queue
      delete QData.connection
      // delete QData.options
      let jobs = []
      if (QData.jobs !== undefined && Array.isArray(QData.jobs)) {
        for (let i = 0; i < QData.jobs.length; i++) {
          let jobObj = await singleCreateJobObj(queueObj, QData.jobs[i])
          jobs.push(jobObj)
        }
      } else {
        jobs = await singleCreateJobObj(queueObj, QData)
      }
      return jobs
    } catch (err) {
      return (err)
    }
  }

  function createJobQueue (dbDriver, queueOption) {
    try {
      rethinkDBInfo = {'jobHost': dbDriver.host, 'port': dbDriver.port, 'jobDB': dbDriver.db, 'jobType': queueOption.name}
      return new Queue(dbDriver, queueOption)
    } catch (err) {
      return (err)
    }
  }

  async function createRethinkJobQueue (qdata) {
    return new Promise(async(resolve, reject) => {
      try {
        // check port number range
        checkPortNumber(newoptions.connection.port)
        .then(async result => {
          let queueObj = await createJobQueue(newoptions.connection, newoptions.queue)
          queueObj.on('error', (err) => {
            // err object is system error
            reject(customError(err))
          })
          let job = await createJob(queueObj, qdata)
          let savedJobs
          await addJob(queueObj, job)
            .then(result => {
              savedJobs = result // {'jobId': result[0].id}
            })
            .catch(err => { customError(err) })
          resolve(savedJobs)
        })
        .catch(err => {
          // this is return custom error
          reject(err)
        })
        // let dbDriver = await createRethinkdbDash(options.connection)
      } catch (err) {
        // some system fatal error happend - no way to recover !!
        reject(customError(err))
      }
    })
  }

  // find job from rethinkDB
  async function findJob (queueObj, val) {
    return new Promise(async (resolve, reject) => {
      try {
        queueObj.findJob(val, true).then((jobs) => {
          // jobs will either be an empty array
          // or an array of Job objects
          resolve(jobs)
        }).catch(err => reject(err))
      } catch (err) {
        reject(err)
      }
    })
  }

  async function findRethinkJob (qdata) {
    return new Promise(async(resolve, reject) => {
      try {
        // check port number range
        checkPortNumber(newoptions.connection.port)
        .then(async result => {
          let queueObj = await createJobQueue(newoptions.connection, newoptions.queue)
          queueObj.on('error', (err) => {
            // err object is system error
            reject(customError(err))
          })

          await findJob(queueObj, qdata.findVal)
          .then(result => {
            resolve(result)
          })
          .catch(err => { customError(err) })
        })
        .catch(err => {
          // this is return custom error
          reject(err)
        })
        // let dbDriver = await createRethinkdbDash(options.connection)
      } catch (err) {
        // some system fatal error happend - no way to recover !!
        reject(customError(err))
      }
    })
  }

  function mergeOptions (fOptions, mOption) {
    try {
      return plugin.util.deepextend({
        queue: fOptions.queue,
        connection: fOptions.connection,
        options: fOptions.options,
        subscription: fOptions.subscription
      }, mOption)
    } catch (err) {
      return fOptions
    }
  }

  function singleCreateJobObj (queueObj, jData) {
    return new Promise(async (resolve, reject) => {
      // if any option pass as parameter it will create jobs
      let newCreateJoboption = jData.options

      delete jData.options

      // Merge Options
      try {
        newCreateJoboption = plugin.util.deepextend(newoptions.options, newCreateJoboption)
      } catch (err) {}

      let job = {}
      job.data = jData
      for (key in newCreateJoboption) {
        if (newCreateJoboption[key]) {
          job[key] = newCreateJoboption[key]
        }
      }
      if (job.dateEnable) job.dateEnable = new Date(job.dateEnable)
      
      let qObj = await queueObj.createJob(job)
      resolve(qObj)
    })
  }

  async function updateRethinkJob (qdata) {
    return new Promise(async(resolve, reject) => {
      try {
        // check port number range
        checkPortNumber(newoptions.connection.port)
        .then(async result => {
          let queueObj = await createJobQueue(newoptions.connection, newoptions.queue)
          queueObj.on('error', (err) => {
            // err object is system error
            reject(customError(err))
          })

          await updateJob(queueObj, qdata.findVal, qdata.data, qdata.options)
            .then(result => {
              resolve(result)
            })
            .catch(err => { customError(err) })
        })
        .catch(err => {
          // this is return custom error
          reject(err)
        })
        // let dbDriver = await createRethinkdbDash(options.connection)
      } catch (err) {
        // some system fatal error happend - no way to recover !!
        reject(customError(err))
      }
    })
  }

  async function updateJob (queueObj, val, jobData, options) {
    return new Promise(async (resolve, reject) => {
      try {
        queueObj.getJob(val, true).then(async (jobs) => {
          if(options) {
            for (key in options) {
              jobs[0][key] = options[key]
            }
          }
          jobs[0].data = jobData
          await jobs[0].update()
          jobs = jobs.map(function (a) { delete a.q; return a })
          resolve(jobs)
        }).catch(err => reject(err))
      } catch (err) {
        reject(err)
      }
    })
  }

  function validateRequestBody (msg) {
    if (msg.request$ !== undefined) {
      var contype = msg.request$.headers['content-type']
      if (!contype || contype.indexOf('application/json') !== 0) {
        let err = {error: {message: gErrMessages['ERR_CONTENT_TYPE'], code: 'ERR_CONTENT_TYPE'}}
        return [err, null]
      }

      if (msg.args !== undefined && msg.args.body !== undefined && msg.args.body !== '') {
        try {
          let paserBody = JSON.parse(msg.args.body)
          return [null, paserBody]
        } catch (err) {
          let err1 = {error: {message: gErrMessages['ERR_INVALID_PRAMATER'], code: 'ERR_INVALID_PRAMATER'}}
          return [err1, null]
        }
      } else {
        let err = {error: {message: gErrMessages['ERR_PRAMATER_MISSING'], code: 'ERR_INVALID_PORT'}}
        return [err, null]
      }
    } else {
      return [null, msg]
    }
  }
}

function checkPortNumber (port) {
  return new Promise((resolve, reject) => {
    if (port > 65535) {
      reject({error: {message: gErrMessages['ERR_INVALID_PORT'], code: 'ERR_INVALID_PORT'}})
    } else {
      resolve(true)
    }
  })
}

function customError (err, errorCode) {
  let errorKey = 'ERR_SERVICE_UNAVAIALBLE'
  if (err.name === 'ReqlDriverError') {
    errorKey = 'ERR_REQLDRIVERERROR'
  } else if (err.name === 'Error'){
    errorKey = 'ERR_INVALID_PRAMATER'
  }
  let errRes = {}
  errRes['error'] = {
    'message': gErrMessages[errorKey] || gErrMessages['ERR_SERVICE_UNAVAIALBLE'],
    'system_message': err.msg || ''
  }
  errRes['status'] = errorCode || 404
  return errRes
}

let gErrMessages = {
  'ERR_INVALID_PORT': 'port number should be in the range [1, 65535]',
  'ERR_SERVICE_UNAVAIALBLE': 'Service not avaialble',
  'ERR_REQLDRIVERERROR': 'RethinkDB service unavaialble',
  'ERR_PRAMATER_MISSING': 'job data missing, Please provide body as paramater',
  'ERR_CONTENT_TYPE': 'Content-Type should be application/json',
  'ERR_INVALID_PRAMATER': 'Please provide valid paramater'
}
