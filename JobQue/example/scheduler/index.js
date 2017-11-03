const app = require('config')
const cxnOptions = app.get('rethinkdb')
var qOptions = app.get('qOptions')

const scheduler = require('flowz-scheduler')
const main_scheduler = new scheduler({
  cxnOptions: cxnOptions,
  qOptions: qOptions
})
