let async = require('asyncawait/async');
let await = require('asyncawait/await');
var axios = require('axios');
var fs = require('fs');
var spath = require('path');
var chokidar = require('chokidar');
var config = require('./config')
console.log('Connected............to plugin Watcher.')
chokidar.watch(spath.join(__dirname, config.watcherPath), { ignored: /(^|[\/\\])\../ }).on('addDir', async(function(path12) {
  console.log('Dirrr', path12, 'has been addedd..');
  if (path12 == spath.join(__dirname, config.watcherPath)) {} else {
    // var data = require(path12)
    console.log('path', spath.join(path12 + '/index.json'))
    let result = new Promise((resolve, reject) => {
      fs.readFile(spath.join(path12 + '/index.json'), function(err, data) {
        if (err) return console.log(err);
        console.log('data', JSON.parse(data))
        resolve(JSON.parse(data));
      });
    });
    var data = Promise.resolve(result).then(async function(dbdata) {
      // console.log('result', JSON.parse(dbdata))
      // console.log('>>>>>>>>>>>>>>>>>>>>>>>', data)
      var res = await (checkData(dbdata))
        // var d = await (savePlugin(data))
        // var r = Promise.resolve(d)
      console.log('33 ::::::::::::::   ', res)
      return dbdata
    });
  }
}))
var checkData = async(function(_data) {
  console.log('111 """"""""""""""""""""', _data)
  var s = await (axios.get(config.serverURI + '/bpmnplugins'))
    // console.log('222 /////////// SSSSSSSSSSSSSSS ////////', s.data.id)
  var flag = false;
  for (let i = 0; i < s.data.data.length; i++) {
    // console.log('type ===== ',)
    if (_data.pluginType == s.data.data[i]['pluginType']) {
      flag = true;
    }
  }
  // console.log('flag === ', flag)
  if (!flag) {
    var res = await (savePlugin(_data))
    return res
  } else {
    return { status: 'exist' }
  }
  // return s.data
})
var savePlugin = async(function(data) {
  console.log('Data', data)
  var s = await (axios.post(config.serverURI + '/bpmnplugins', data))
    // console.log('222 /////////// SSSSSSSSSSSSSSS ////////', s.data.id)
  return s.data.id
})