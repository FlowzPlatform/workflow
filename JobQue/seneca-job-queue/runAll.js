const cp = require('child_process')
var files = ['symmetric-worker', 'worker-need', 'worker-web', 'job-web']

for (var i in files) {
  let n = cp.fork(`${__dirname}/${files[i]}`)
}
