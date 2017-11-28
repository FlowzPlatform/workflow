const app = require('./config')
const cxnOptions = app.rethinkdb
var qOptions = app.qOptions

const scheduler = require('flowz-scheduler')
const main_scheduler = new scheduler({
  cxnOptions: cxnOptions,
  qOptions: qOptions
})
