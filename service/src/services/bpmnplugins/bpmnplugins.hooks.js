let async = require('asyncawait/async');
let await = require('asyncawait/await');
const errors = require('feathers-errors');
let config = require('config');
var axios = require('axios');
var _ = require('lodash');
var serverUrl = 'http://' + config.host + ':' + config.port
var FormData = require('form-data');
var temp = "for (let i = 0; i < job.data.input.length; i++) {\r\n   job.data.output[i] = {}\r\n   for (key in job.data.input[i]) {\r\n\t  job.data.output[i][key] = job.data.input[i][key]\r\n   }\r\n }\r\nawait job.update()\r\nresolve('done')";
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      hook => beforeCreate(hook)
    ],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

var schemaequalChecker = function(item) {
  var allschema = await (getallSchema())
  var flag = false
  for (let [i, obj] of allschema.entries()) {
    var sid = obj.id
    // delete obj._id
    delete obj.id
    delete obj.createTemplate
    delete obj.emailTemplate
    delete obj.viewTemplate
    delete obj.createdAt
    delete obj.isdeleted
    var s = _.isEqual(obj, item)
    if (s) {
      return { status: s, id: sid }
    }
  }
  return { status: flag }
}
var checkpulginexist = async(function(sdata) {
  var _pdata = await (axios.get(serverUrl + '/bpmnplugins'))
  var flag = false;
  for (let i = 0; i < _pdata.data.data.length; i++) {
    if (sdata.pluginType == _pdata.data.data[i]['pluginType']) {
      flag = true;
    }
  }
  if (!flag) {
    console.log('Plugin Not..Exist')
    return { status: false }
  } else {
    console.log('Plugin Exist')
    return { status: true }
  }
})
var sendError = function(hook) {
  throw new Error('Plugin Already Imported.')
}
var beforeCreate = async(function(hook) {
  // console.log('Hook Data.......................', hook.data)
  var n = await (checkpulginexist(hook.data))
  // console.log('checkpulginexist::: ', n)
    // console.log('checkpulginexist...................', n)
  if (n.status) {
    // throw new Error('Message text can not be empty')
    hook.result = { data: 'already exist', code: 500 }
    sendError(hook)
      // hook.error = new errors.BadRequest('Something is wrong');
      // hook.error = new errors.Conflict('This entry already exists');
      // return hook
  } else {
    // console.log('Here.....................')
    for (let [inx, iObj] of hook.data.input.entries()) {
      // iObj['i_id'] = iObj.id
      var s = await (schemaequalChecker(iObj.entityschema[0]))
      if (s.status) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> input isEqual :: ', s.id)
        iObj.entityschema = s.id
      } else {
        var res = await (checkSchemaObj(iObj.entityschema[0]))
        // console.log('>>>>>>>>>>>>>>>> :: ', res, '  :: >>>>>>>>>>>>>')
        iObj.entityschema = res
      }
    }
    for (let [inx, oObj] of hook.data.output.entries()) {
      for (var [i, obj] of oObj.entityschema.entries()) {
        var s = await (schemaequalChecker(obj))
        if (s.status) {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> output isEqual :: ', s.id)
          oObj.entityschema = s.id
        } else {
          var s = await (checkSchemaObj(obj))
          // console.log('>>>>>>>>>>>>>>>> :: ', res, '  :: >>>>>>>>>>>>>')
          oObj.entityschema = s
        }
      }
    }
    hook.data['pluginType'] = hook.data.pluginType
    hook.data['image'] = hook.data.image
      // hook.data['imgurl'] = ""
    // console.log('..................1111111111111111111111', hook.data)
    let workerobject = {}
    if (hook.data.worker == undefined) {
      workerobject.type = 'text/javascript'
      workerobject.src = temp
    } else {
      workerobject.type = hook.data.worker.type
      let jsdata = await (axios.get(hook.data.worker.src))
      workerobject.src = jsdata.data
    }
    // console.log('..................22222222222222222222222')
    hook.data['worker'] = workerobject
    let registerprocess = await (registerWorkerProcess(hook.data, workerobject.src))
      // console.log('..................333333333333333333333')
    hook.data['createdOn'] = new Date()
    hook.data['isEnable'] = true
    hook.data['url'] = ""
    delete hook.data.type
    delete hook.data.imageStr
    // console.log('hook.data.............. Final...', hook.data)
  }
})
var registerWorkerProcess = async(function(obj, src) {
  // console.log('inside registerWorkerProcess', obj, '  ::src:: ' ,src)
  let workerparameter = {}
  workerparameter.jobtype = obj.pluginType + '_worker'
  workerparameter.jobprocess = src
  var form = new FormData();
  form.append("jobtype", obj.pluginType + '_worker');
  form.append("jobprocess", src);
  const config1 = { headers: form.getHeaders() };
  // console.log('inner 111111111111111111', config.registerWokerAPI)
  let registeredWorker = await (axios.post(config.registerWokerAPI, form, config1))
  // console.log('inner 222222222222222222')

  if (registeredWorker.err) {
    return undefined
  } else {
    // console.log('inner 333333333333333')
    let callputmethod = await (axios.put(config.registerProcessAPI + obj.pluginType + '_worker'));
    return registeredWorker
  }
  // console.log('inner 444444444444444')
  return registeredWorker
})
var checkSchemaObj = async(function(obj) {
  obj['createTemplate'] = []
  obj['emailTemplate'] = []
  obj['viewTemplate'] = []
  obj['isdeleted'] = false
  obj['createdAt'] = new Date()
  var flag = await (checkFlag(obj))
  if (!flag) {
    var res = await (saveSchemaObj(obj))
    return res
  } else {
    for (let [i, sObj] of obj.entity.entries()) {
      if (typeof sObj.type === 'object') {
        sObj.type = await (checkSchemaObj(sObj.type))
      }
    }
  }
  var res = await (saveSchemaObj(obj))
  // console.log('.......res.......', res)
  return res
})
var checkFlag = function(obj) {
  var status = false
  for (let [i, sObj] of obj.entity.entries()) {
    if (typeof sObj.type === 'object') {
      status = true
    }
  }
  return status
}
var saveSchemaObj = async(function(obj) {
  var res = await (axios.post(serverUrl + '/schema', obj))
  console.log('......................................................id:::: ', res.data.id)
  return res.data.id
})
var getallSchema = async(function() {
  var count = await(axios.get(serverUrl + '/schema?$limit=0'))
  var limit = count.data.total
  var res = await (axios.get(serverUrl + '/schema?limit='+ limit ))
  return res.data.data
})