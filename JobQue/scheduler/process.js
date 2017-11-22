const vm = require('vm')
const rp = require('request-promise')
const pino = require('pino')
var config = require('./config.json')
const PINO = config.pinoConsole

global.options = []
for (var i=4; i<process.argv.length; i++) {
  options.push(process.argv[i])
}
const PROCESS_URL = process.argv[3]

async function getProcess (jobType) {
  return new Promise((resolve, reject) => {
    rp(PROCESS_URL + jobType)
      .then(function (jobProcessCode) {
        resolve(jobProcessCode)
      })
      .catch(function (err) {
        reject(err)
      })
  })
}

let executeProcess = async function (jobType) {
  try {
    let processCode = await getProcess(jobType)
    const script = new vm.Script(`(function(require) {`+processCode +`})`, { filename: 'processTrace.vm' })
    script.runInThisContext()(require)
    pino(PINO).info('Process: '+jobType+' created')
  } catch (e) {
    pino(PINO).error(e)
    pino(PINO).error('unable to load child worker')
  }
}

executeProcess(process.argv[2])
