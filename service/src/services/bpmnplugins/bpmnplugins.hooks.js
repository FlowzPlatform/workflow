let async = require('asyncawait/async');
let await = require('asyncawait/await');
let config = require('config');
var axios = require('axios');

var serverUrl = 'http://'+config.host+':'+config.port
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


var beforeCreate = async( function(hook) {
  for(let [inx, iObj] of hook.data.input.entries()) {
    // iObj['i_id'] = iObj.id
    var res = await (checkSchemaObj(iObj.entityschema[0]))
    iObj.entityschema = res
    // delete iObj.id 
  }
  for(let [inx, oObj] of hook.data.output.entries()) {
    // oObj['o_id'] = oObj.id
    // var res = []
    for(var [i, obj] of oObj.entityschema.entries()) {
      var s = await (checkSchemaObj(obj))
      // console.log('s', s)
      oObj.entityschema = s
    }
    // oObj.entityschema = res
    // delete oObj.id 
  }
  hook.data['worker_type'] = hook.data.type
  hook.data['imgurl'] = hook.data.imageStr
  // hook.data['imgurl'] = ""
  hook.data['worker_type_id'] = ""
  hook.data['createdOn'] = new Date()
  hook.data['isEnable'] = true
  hook.data['url'] = ""
  delete hook.data.type
  delete hook.data.imageStr
})

var checkSchemaObj = async(function(obj) {
  obj['createTemplate'] = []
  obj['emailTemplate'] = []
  obj['viewTemplate'] = []
  var flag = await (checkFlag(obj))
  // console.log('?????????????????????', flag)
  if(!flag) {
    var res = await (saveSchemaObj(obj))
    return res
  } else {
    for (let [i, sObj] of obj.entity.entries()) {
      if (typeof sObj.type === 'object' ) {
        // console.log('1111111111111', sObj.type)
        sObj.type = await (checkSchemaObj(sObj.type))
      }
    }
    // obj.entity.type =  await (checkSchemaObj(obj.entity.type))
  }

  var res = await (saveSchemaObj(obj))
  return res
})

var checkFlag = function(obj) {
  var status = false
  for(let [i, sObj] of obj.entity.entries()) {
    if (typeof sObj.type === 'object'){
      // console.log('1111111111111', sObj.type)
      status = true
    }
  }
  // console.log('status', status)
  return status
}

var saveSchemaObj = async( function(obj) {
  var res = await (axios.post(serverUrl + '/schema', obj))
  return res.data.generated_keys[0]
})