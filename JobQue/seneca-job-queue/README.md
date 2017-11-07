### seneca-rethink-jobqueue

Using seneca-rethink-jobqueue we can create job and process a job queue dynamically.


If you're using this module, and need help, you can:
- Post a [github issue][],


### Create Job using Rest API
Start rest api service as
```
node job-web.js
```
#### rest-api request using PostMen

http://localhost:5000/job/create

post data like as below

```
{
	"to":"abcd@yourdomain.com",
	"from":"info@yourdomain.com",
	"subject":"this is test mail",
	"body":"this is message body"
}
```
#### parameter options

post data like as below

```
{
  "connction" : {
    "host": "localhost",
    "port": 28015,
    "db": "jobqueue"
  },
  "queue" : {
    "name": "registartion"
  },
	"to":"abcd@yourdomain.com",
	"from":"info@yourdomain.com",
	"subject":"this is test mail",
	"body":"this is message body"
}
```

#### multiple job created

post data like as below

```
{
	"connction" : {
		"host":"localhost",
	    "port": 28015,
	    "db": "jobqueue"
	  },
	  "queue" : {
	    "name": "registartion"
	  },
	  "options" : {
	    "priority": "normal",
	    "timeout": 499999,
	    "retrymax": 1,
	    "retrydelay": 500000
	  },

	"jobs" : [
		{
			"subject":"this is test mail-1",
			"options" : {
			    "priority": "high",
			    "timeout": 700000,
			    "retrymax": 5,
			    "retrydelay": 100000
			  }
		},
		{
			"subject":"this is test mail-2",
			"options" : {
				"priority": "highest",
			    "timeout": 700000,
			    "retrymax": 4,
			    "retrydelay": 100000,
			    "name" :"Password-Update-Mail"
			}
		},
		{
			"subject":"this is test mail-3",
			"options" : {
			    "priority": "medium",
			    "timeout": 700000,
			    "retrymax": 3,
			    "retrydelay": 100000
			  }
		}
	]
}
```

### find job using REST API

http://localhost:5000/job/find

post data like as below

```
"find": {
	"status":"waiting"
	}
```
#### more parameter options

post data like as below

```
{
  "connction" : {
    "host": "localhost",
    "port": 28015,
    "db": "jobqueue"
  },
  "queue" : {
    "name": "registartion"
  },
  "find": {
  	"data":{"subject":"this is test mail"}
  }
}
```

## Dynamic job-type process

Using API upload jobtype wise process code.
for dynamic execution need to start below javascript file

start below javascript file
```
node job-web.js
node worker-web.js
node worker-need.js
node symmetricWorker.js
```
#### example to upload job queue process code
post data like as below
post URL
```
localhost:3000/upload-worker-process
```
post parameter
```
jobtype = RegistrationEmail
jobprocess =  {
							  const nodemailer = require('nodemailer')
							  let transporter = nodemailer.createTransport({
							    service: 'SMTP',
							    host: 'smtp.gmail.com',
							    port: 465,
							    secure: true,
							    auth: {
							      user: 'your@gmail.com',
							      pass: 'your-password'
							    }
							  })

							  // setup email data with unicode symbols
							  let mailOptions = {
							    from: job.data.from, // sender address
							    to: job.data.to, // list of receivers
							    cc: job.data.cc, // list of receivers
							    subject: job.data.subject, // Subject line
							    text: job.data.body, // plain text body
							    html: job.data.body // html body
							  }
							  // send mail with defined transport object
							  transporter.sendMail(mailOptions, (error, info) => {
							    console.log(info)
							    if (error) {
							      reject(error)
							    }
							    resolve('Message ' +info.messageId +' sent: '+ info.response)
							  })
							}
```
##### Note : In job process code you have to set resolve and reject as response for next job process in job queue

To register jobtype for symmetricWorker
use put method
```
http://localhost:9001/register-jobtype/RegistrationEmail
```

use delete method for symmetricWorker
```
http://localhost:9001/register-jobtype/RegistrationEmail
```



## Extra Options

#### [1] create job-queue using seneca-rethink-jobqueue plugin

To install, simply use npm.

```
npm install seneca-rethink-jobqueue
```

### Usage of seneca rethink job queue
```
let rjob = require('seneca-rethink-jobqueue')

// for create rethinkdb job create

let bodyData = {
	"to":"abcd@yourdomain.com",
	"from":"info@yourdomain.com",
	"subject":"Register successfully",
	"body": "you are registered successfully on our site"
}

rjob.createJob(bodyData)
.then(result => console.log(result))
.catch(err => console.log(err))


// for find job data

let findData = {
	"findVal": {
		"data": {"subject":"Register successfully"}
	}
}

rjob.findJob(findData)
.then(result => console.log(result))
.catch(err => console.log(err))

```

####[2] create job-queue using in seneca-mesh
start server using node
node server.js
### client

```
let seneca = require('seneca')

let pluginPin = 'role:job,cmd:create'

let bodyData = {
	"to":"abcd@yourdomain.com",
	"from":"info@yourdomain.com",
	"subject":"this is test mail",
	"body":"this is message body"
}

seneca()
	.use('mesh')
	.ready(function () {
		let _senecaObj = this
		_senecaObj.act(pluginPin, {msg: bodyData}, (err, done) => {
			try {
				if (err) {
					console.log('Error:', err)
					//throw err;
				}
				console.log('Response:', done)
			} catch (e) {
				console.log('Error:', e)
			}
			_senecaObj.close((err) => {
					if (err) {
						console.log('Close Error:', e)
					} else {
						console.log('seneca closed.')
					}
				})
		})
	})
```
