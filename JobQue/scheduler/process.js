const vm = require('vm')
const rp = require('request-promise')
const pino = require('pino')
const config = require('./default.json')
const { exec, fork } = require('child_process')
const PINO = config.pinoConsole

global.options = []
for (var i = 4; i < process.argv.length; i++) {
  options.push(process.argv[i])
}
const PROCESS_URL = process.argv[3]

async function getProcess(jobType) {
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
    const script = new vm.Script(`(function(require) {` + processCode + `})`, { filename: 'processTrace.vm' })
    script.runInThisContext()(require)
    pino(PINO).info({ Process: jobType, fId: process.argv[6], pId: process.pid }, 'process created')
  } catch (e) {
    let file = __filename;
    pino(PINO).error(e.message)
    let error = e.message.split("'");
    error[0] = error[0].slice(0, -1);
    if (error[0] === 'Cannot find module') {
      exec('cd ../scheduler && npm i ' + error[1], (error, stdout, stderr) => {
        console.log(`${stdout}`);
        process.argv.splice(0, 2);
        fork(`${file}`, process.argv)
      })
    } else {
      pino(PINO).error('unable to load child worker', jobType)
    }
  }
}

executeProcess(process.argv[2])
