// let async = require('asyncawait/async');
// let await = require('asyncawait/await');
var axios = require('axios');
var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar');
var config = require('config')

chokidar.watch(path.join(__dirname, '../bpmnPlugin'), { ignored: /(^|[\/\\])\../ }).on('addDir', function (path) {
})
