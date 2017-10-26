const app = require('config')
const cxnOptions = app.get('rethinkdb')
var qOptions = app.get('jOptions')
qOptions.name = 'end_worker'

const worker = require('./worker')(cxnOptions, qOptions)
