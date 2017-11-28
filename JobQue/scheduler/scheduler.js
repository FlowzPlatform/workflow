const app = require('./config')
const cxnOptions = app.rethinkdb
const qOptions = app.qOptions
const serviceURL = app. serviceURL
const jobURL = app.jobURL

const scheduler = require('./index')
const main_scheduler = new scheduler({
  cxnOptions: cxnOptions,
  qOptions: qOptions,
  serviceURL: serviceURL,
  jobURL: jobURL
})
