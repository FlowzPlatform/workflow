let async = require('asyncawait/async');
let await = require('asyncawait/await');
var axios = require('axios');
var fs = require('fs');
var spath = require('path');
var chokidar = require('chokidar');
var config = require('./config')
chokidar.watch(spath.join(__dirname, config.watcherPath), { ignored: /(^|[\/\\])\../ }).on('addDir', async(function(path12) {
  if (path12 == spath.join(__dirname, config.watcherPath)) {} else {
    // var data = require(path12)
    let result = new Promise((resolve, reject) => {
      fs.readFile(spath.join(path12 + '/index.json'), function(err, data) {
        if (err) return console.log(err);
        resolve(JSON.parse(data));
      });
    });
    var data = Promise.resolve(result).then(async function(dbdata) {
      var res = await (checkData(dbdata))
        // var d = await (savePlugin(data))
        // var r = Promise.resolve(d)
      return dbdata
    });
  }
}))
var checkData = async(function(_data) {
  var s = await (axios.get(config.serverURI + '/bpmnplugins'))
  var flag = false;
  for (let i = 0; i < s.data.data.length; i++) {
    if (_data.pluginType == s.data.data[i]['pluginType']) {
      flag = true;
    }
  }
  if (!flag) {
    var res = await (savePlugin(_data))
    return res
  } else {
    return { status: 'exist' }
  }
  // return s.data
})
var savePlugin = async(function(data) {
  var s = await (axios.post(config.serverURI + '/bpmnplugins', data))
  return s.data.id
})