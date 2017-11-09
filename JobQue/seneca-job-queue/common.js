var seneca = require('seneca')({log:'silent'})
const config = require('config')
const pino = require('pino')

const pluginCreate = config.get('plugins.createPattern')
const pluginFind = config.get('plugins.findPattern')
const pluginQueue = config.get('plugins.queuePattern')
const pluginUpdate = config.get('plugins.updatePattern')

module.exports.createJob = function (bodyData) {
  return new Promise((resolve, reject) => {
    seneca.use('job').act(pluginCreate, bodyData, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

module.exports.findJob = function (bodyData) {
  return new Promise((resolve, reject) => {
    seneca.use('job').act(pluginFind, bodyData, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

module.exports.getJobQueue = function (options) {
  return new Promise((resolve, reject) => {
    seneca.use('job').act(pluginQueue, options, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}
