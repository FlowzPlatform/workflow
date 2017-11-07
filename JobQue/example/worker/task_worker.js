const app = require('config')
const cxnOptions = app.get('rethinkdb')
var qOptions = app.get('jOptions')
qOptions.name = 'task_worker'

const worker = require('flowz-worker')
const task_worker = new worker({
  cxnOptions: cxnOptions,
  qOptions: qOptions
})
