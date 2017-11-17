const config = require('./config.json')
var app = require('express')()
var bodyParser = require('body-parser')
var multer = require('multer')
var upload = multer()
const _ = require('lodash')
const cp = require('child_process')
const pino = require('pino')
const PINO = config.pino
const rethinkdb = config.rethinkdb
const table = config.table
const userTable = config.users
const cxnOptions = config.cxnOptions
const cors = require('cors')
const rdash = require('rethinkdbdash')(cxnOptions)
const r = require('rethinkdbdash')(rethinkdb)
var connected = false
var users = []

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/subscribe-mail', upload.array(), async function (req, res) {
	return new Promise( async (resolve, reject) => {
		try {
      addUserToService(req.body)
			resolve(res.send(req.body))
		} catch (e) {
			pino(PINO).error(e)
			reject(res.send(e))
		}
	})
})

app.delete('/subscribe-mail', upload.array(), async function (req, res) {
	return new Promise( async (resolve, reject) => {
		try {
      removeUserFromService(req.body)
			resolve(res.send(req.body))
		} catch (e) {
			pino(PINO).error(e)
			reject(res.send(e))
		}
	})
})

function addUserToService (info) {
	rdash.table(userTable).insert(info).run()
	users.push(info.user)
}

function checkTableExistsOrNot () {
  return new Promise((resolve, reject) => {
    r.tableList().run().then(function (tableNames) {
      if (_.includes(tableNames, table)) {
        resolve('table already exists')
      } else {
        r.tableCreate(table).run()
        resolve('table created')
      }
    })
  })
}

function checkUserTableExistsOrNot () {
  return new Promise((resolve, reject) => {
    rdash.tableList().run().then(function (tableNames) {
      if (_.includes(tableNames, userTable)) {
        resolve('table already exists')
      } else {
        rdash.tableCreate(userTable).run()
        resolve('table created')
      }
    })
  })
}

function removeUserFromService (info) {
	rdash.table(userTable).filter(info).delete().run()
  let removedUser = _.remove(users, function(user) {
    return user == info.user
  })
}

async function fetchUsers () {
	return new Promise (async (resolve, reject) => {
		try {
			let userList = await rdash.table('users').run()
			for (var i in userList) {
				users.push(userList[i].user)
			}
      resolve('done')
		}
		catch (e) {
			reject('error')
		}
	})
}

function startWatch () {
  r.table(table).changes().run(function(err, cursor) {
    cursor.each((err, change) => {
      if (change.new_val === null && change.old_val && _.intersection(change.old_val.rcpTo,users).length > 0) {
        pino(PINO).warn('mail deleted')
      }
      else if (change.old_val === null && change.new_val && _.intersection(change.new_val.rcpTo,users).length > 0) {
        pino(PINO).info('new mail recieved')
      }
      else if (change.old_val && _.intersection(change.old_val.rcpTo,users).length > 0 && change.new_val && _.intersection(change.new_val.rcpTo,users).length > 0){
        pino(PINO).warn('mail updated')
      }
    })
  })
}

async function beginMailWatch () {
	if (connected) {
		await fetchUsers()
		startWatch()
	} else {
		setTimeout(beginMailWatch, 2000)
	}
}

checkTableExistsOrNot()
  .then(res => {
    checkUserTableExistsOrNot()
      .then(response => {
        connected=true
      })
  })

beginMailWatch()

app.listen(8888)
