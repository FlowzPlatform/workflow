'use strict'

var seneca = require('seneca')({log: 'silent'})
const Web = require('seneca-web')
const cors = require('cors')
const webconfig = require('./config')
var app = require('express')()
const pino = require('pino')

const pluginCreate = webconfig.plugins.createPattern
const pluginFind = webconfig.plugins.findPattern
const pluginUpdate = webconfig.plugins.updatePattern
const PINO = webconfig.pino
const webPort = webconfig.web_option.port
const urlPrefix = webconfig.web_option.urlPrefix

var Routes = [
  {
    prefix: urlPrefix,
    pin: pluginCreate,
    map: {
      create: {GET: false, POST: true}
    }
  },
  {
    prefix: urlPrefix,
    pin: pluginUpdate,
    map: {
      update: {GET: false, POST: true}
    }
  },
  {
    prefix: urlPrefix,
    pin: pluginFind,
    map: {
      find: {GET: false, POST: true}
    }
  }
]

app.use(cors())

var config = {
  routes: Routes,
  adapter: require('seneca-web-adapter-express'),
  context: app,
  options: {parseBody: true}
}

seneca.client()
  .use(Web, config)
  .use('job')
  .ready(() => {
    var server = seneca.export('web/context')()
    server.listen(webPort, () => {
      pino(PINO).info('server started on:', webPort)
    })
  })
