/* eslint-disable no-unused-vars */
let async = require('asyncawait/async');
let await = require('asyncawait/await');
let config = require('config');
var axios = require('axios');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var chokidar = require('chokidar');
var db = '../DBConnection/db.json';
var file = require(db);
var dbapi = [];

_.forEach(file, function(dbs, i) {
  var flag = false
  _.forEach(dbs.dbinstance, function(instance) {
    if (instance.isenable) {
      flag = true
    }
  })
  if (flag) {
    var api = require('../DBConnection/' + i + 'api')
    dbapi.push({ db: i, api: api });
    api.choose()
  }
})
let readfile = async(function() {
  fs.readFile(path.join(__dirname, '../DBConnection/db.json'), function(err, data) {
    // console.log('reading file' + data)
    // console.log('reading file form instance' + data)
    if (err) return console.log(err);
    if (data == '') {
      console.log('BLANCK DATA');
      return 'nodata';
    }
    file = JSON.parse(data);
    dbapi = [];
    _.forEach(file, function(dbs, i) {
      var flag = false
      _.forEach(dbs.dbinstance, function(instance) {
        if (instance.isenable) {
          flag = true
        }
      })
      if (flag) {
        var api = require('../DBConnection/' + i + 'api')
        dbapi.push({ db: i, api: api });
        // console.log('From..........................................instance')
        api.choose()
      }
    })
  });
})
var getQuery = async(function(dbName, type, queryFor) {
  let result = new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '../DBConnection/db.json'), function(err, data) {
      if (err) return console.log(err);
      resolve(JSON.parse(data));
    });
  });
  var _data = Promise.resolve(result).then(function(dbdata) {
    var instance;
    _.forEach(dbdata[dbName][type], function(instances, db) {
      if (Object.keys(instances)[0] == queryFor) {
        var obj = _.find(instances)
        if (obj != undefined) {
          instance = obj
        }
      }
    })
    return instance
  });
  return _data
});

// One-liner for current directory, ignores .dotfiles 
chokidar.watch(path.join(__dirname, '../DBConnection/db.json'), { ignored: /(^|[\/\\])\../ }).on('change', async(function(path) {
  // console.log('From..........................................instance111')
  // console.log('File', path, 'has been changed');
  delete require.cache[require.resolve('../DBConnection/db')];
  delete require.cache[require.resolve('../DBConnection/mongoapi')];
  delete require.cache[require.resolve('../DBConnection/rethinkapi')];
  delete require.cache[require.resolve('../DBConnection/elasticapi')];
  delete require.cache[require.resolve('../DBConnection/mysqlapi')];
  var checking = await (readfile());
  if (checking == 'nodata') {
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ from instance');
    await (readfile);
  }
}))

var checkFlag = async(function(data) {
  var flag = false
  _.forEach(data, async(function(obj, index) {
    // console.log('Obj', obj, '..k..', k)la
    _.forEach(obj, async(function(val, key) {
      // console.log(key, val)
      if (key == 'database') {} else {
        if (Array.isArray(val)) {
          _.forEach(val, async(function(obj) {
            if (!obj.hasOwnProperty('refid')) {
              flag = true
            }
          }))
        }
      }
    }))
  }))
  return flag
})
var checkFlagforGet = async(function(mObj) {
  var flag = false
    // _.forEach(data, async(function(obj, index){
    // console.log('Obj', obj, '..k..', k)la
  _.forEach(mObj, async(function(val, key) {
      // console.log(key, val)
      if (key == 'database') {} else {
        if (Array.isArray(val)) {
          _.forEach(val, async(function(obj) {
            if (obj.hasOwnProperty('refid')) {
              flag = true
            }
          }))
        }
      }
    }))
    // }))  alterTableAndAddField
  return flag
})
var checkDataObj = async(function(data, id, res) {
  console.log("calling >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  for (let [dIndex, dObj] of data.entries()) {
    // if(dObj.hasOwnProperty('Schemaid')) {
    //   // console.log('{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{')
    //   var a = await (setSchemaData(dObj.Schemaid))
    //   // console.log('}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}', a)
    // }
    // console.log('.......', dIndex, dObj)
    for (let sKey in dObj) {
      // console.log('.....', sObj)
      // console.log('.....................................................................')
      // console.log('obj', dObj, sKey, dObj[sKey], dIndex)
      // console.log('.....................................................................')
      // if (sKey == 'database') {
      // }
      // else {
      if (Array.isArray(dObj[sKey])) {
        var status = await (checkFlag(dObj[sKey]))
          // console.log('...................................................')
          // console.log('dObj[sKey]', dObj[sKey], 'sKey', sKey, 'dObj', dObj, 'res', res)
          // console.log('...................................................')
          // console.log('Status of Array.............................', status)
        if (!status) {
          // console.log('postSchemaData', postSchemaData)
          // var entityType = await(FindEntitytype(sKey, postSchemaData))
          // console.log('}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}')
          // console.log('entityType', entityType)
          // var Database = await (giveDatabase(entityType))
          // console.log('|||||||||||||||||||||||||||||||||||||', entityType, Database)
          // console.log('Val....not contain any array.......')
          var entityType = await (FindEntitytype(sKey, res))
          var _res = await (getSchemaData(entityType))
            // console.log('_res', _res, '\nres...', res)
          for (let [inx, obj] of dObj[sKey].entries()) {
            // console.log('?????????????????????????', sKey)
            var s = false
            for (let k in obj) {
              if (Array.isArray(obj[k])) {
                s = true
              }
            }
            if (!s) {
              console.log('<<<<<<<<<<<<<', _res)
              schemaid = _res.id
              objid = await (saveData(obj, _res))
            } else {
              console.log('@@@@.............', res)
              schemaid = res.id
              objid = await (saveData(obj, res))
            }
            // console.log('res=====================================', res)
            // var objid = await (saveData(obj, res.database))
            // console.log('jjksjdfkldsssssssssssssssssss', typeof objid, objid)
            objid = objid.toString()
              // console.log('?????????????????????????/////', objid, typeof objid)
            for (let key in obj) {
              delete obj[key]
            }
            obj.refid = objid
              // obj.schemaid = schemaid
          }
        } else {
          // console.log('..::::::::::::::::::..', dObj[sKey], sKey, dObj) 
          var entityType = await (FindEntitytype(sKey, res))
            // console.log('........', entityType)
          var _res = await (getSchemaData(entityType))
            // console.log('_res', _res)
            // var entityType = await(FindEntitytype(sKey, postSchemaData))
            // var res = await (setSchemaData(entityType))
            // console.log('entityType,,, ', entityType)
          var resp = await (checkDataObj(dObj[sKey], entityType, _res))
          dObj[sKey] = resp
            // console.log('contain array...............recursive.....', resp)
        }
      }
      // }
    }
  }
  for (let [inxx, object] of data.entries()) {
    // console.log('>>>>>>>>>>>>>>> ', res)
    var id = await (saveData(object, res))
    id = id.toString()
    for (let okey in object) {
      delete object[okey]
    }
    object.refid = id
      // console.log('qqqqqqqqqqqqqqqqqqqqqqq', object)
  }
  return data
})
var FindEntitytype = async(function(fieldname, data) {
  // console.log('FindEntitytype :::::::::::', fieldname)
  for (let [inxx, object] of data.entity.entries()) {
    // console.log('?///////////////', object)
    if (object.name == fieldname) {
      return object.type
    }
    // console.log('...', object, inxx)
  }
})
var getSchemaData = async(function(id) {
  // console.log('setSchemaData calling >>>>>>>>>>>')
  var res = await (axios.get('http://' + config.get('host') + ':' + config.get('port') + '/schema/' + id))
    // console.log('res', res)
    // postSchemaData = res.data 
  return res.data
})
var getallSchemaData = async(function() {
  var res = await (axios.get('http://' + config.get('host') + ':' + config.get('port') + '/schema/'))
  return res.data
})
var giveDatabase = async(function(schemaid) {
  var res = await (axios.get('http://' + config.get('host') + ':' + config.get('port') + '/schema/' + schemaid))
  console.log('response from giveDatabase', res.data)
    // postSchemaData = res.data 
  return res.data.database
})
var saveData = async(function(data, res) {
  console.log('save calling...................', data, res)
    // var database;
    // if(data.Schemaid != undefined) {
    // database = await (giveDatabase(data.Schemaid))
    // console.log('??????????????????????????', database)
    // console.log('Database not undefined found....', database)
    // } else {
    /////////////////////// 
    // database = yes
    // console.log('Database undefined found.......', database)
    // }
    // console.log('data', data, 'yes', yes)
    // if(database == 'single') {
    //   var id = data.Schemaid
    //   var res = await (getSchemaData(id))
    //   database = res.database
    // }
  
  var _dbindex = _.findIndex(dbapi, { 'db': res.database[0] });
  // for(let [i, obj] of dbapi.entries()) {
  //   if(obj.db == database[0]) {
  //     _dbindex = i
  //   }
  // }
  
  if (typeof res._id !== 'undefined') {
    var dbdata = await (dbapi[_dbindex].api.postflowsInstance(data, res.database[1], res.title));
  } else {
    var dbdata = await (dbapi[_dbindex].api.postflowsInstance(data, res.database[1]));
  }
  console.log('Return Instance id .........', dbdata)
  return dbdata;
})
var setData = async(function(data) {
  // console.log('????????????????????????????????????????')
  var id = data[0].Schemaid
  var res = await (getSchemaData(id))
    // console.log('entity???????????', res)
    // console.log('id.............', id)
  var _res = await (checkDataObj(data, id, res))
  return _res
})
var getInstance = async(function(id, schemaid, columnname) {
  var instance = []
  var isMysql = false;
  dbapi.forEach(function(db) {
    let _promise = new Promise((resolve, reject) => {
      // console.log('????????????????????', db.db)
      if (db.db == 'mysql') {
        isMysql = true
      }
      if (typeof schemaid !== 'undefined') {
        db.api.getThisflowsInstance(id, schemaid, columnname).then((data) => {
          resolve(data);
        })
      } else {
        db.api.getThisflowsInstance(id).then((data) => {
          resolve(data);
        })
      }
    });
    instance.push(_promise)
  });
  // }
  var _data = Promise.all(instance).then(async(function(response) {
    var obj;
    response.forEach(function(item) {
        if (item[0] != undefined) {
          obj = item[0]
        }
      })
      // console.log('????????????????????', obj)
    var flag = await (checkFlagforGet(obj))
      // console.log(flag)
    if (!flag) {
      return obj
    } else {
      for (let okey in obj) {
        // console.log(okey, '=', obj[okey])
        if (okey == 'database') {} else {
          if (Array.isArray(obj[okey])) {
            for (let [index, insideObj] of obj[okey].entries()) {
              // console.log('11111111111okey1111111111111111111111', okey)
              // console.log('isMysql', isMysql)
              // console.log('111111111111OBJ111111111111111111111', obj)
              if (isMysql) {
                obj[okey][index] = await (getInstance(insideObj.refid, obj.Schemaid, okey))
              } else {
                obj[okey][index] = await (getInstance(insideObj.refid))
              }
              // console.log('222222222222222222222222222222222', obj[okey][index], insideObj)
            }
          }
        }
      }
      return obj
    }
  }))
  return _data;
})
var getallInstance = async(function(data) {
  for (let [i, obj] of data.entries()) {
    for (let k in obj) {
      if (k == 'database') {} else {
        if (Array.isArray(obj[k])) {
          for (let [index, insideObj] of obj[k].entries()) {
            // console.log('222222222222222222222222222222222', insideObj)
            // console.log('111111111111111111111111111111111', k)
            // console.log('111111111111111111111111111111111', obj.Schemaid)
            if (/^\d+$/.test(obj.Schemaid)) {
              obj[k][index] = await (getInstance(insideObj.refid, obj.Schemaid, k))
            } else {
              obj[k][index] = await (getInstance(insideObj.refid))
            }
          }
        }
      }
    }
  }
  return data
})
var getActualInstance = async(function(id, res) {
  var instance = []
  dbapi.forEach(function(db) {
    if(db.db == res.database[0]) {
      let _promise = new Promise((resolve, reject) => {
        db.api.getThisflowsInstance(id, res.title, res.database[1]).then((data) => {
          resolve(data);
        })
      });
      instance.push(_promise)
    }
  });
  // }
  var _data = Promise.all(instance).then(async(function(response) {
    return response[0]
  }))
  return _data;
})
var updateData = async(function(id, data, res) {
  console.log('update calling...................')
  var _dbindex = _.findIndex(dbapi, { 'db': res.database[0] });
  var dbdata = await (dbapi[_dbindex].api.putflowsInstance(id, data, res.title, res.database[1]));
  console.log('dbdata..........')
  return dbdata;
})
var deleteData = async(function(id, res) {
  console.log('delete calling...................')
  var _dbindex = _.findIndex(dbapi, { 'db': res.database[0] });
  var dbdata = await (dbapi[_dbindex].api.deleteThisflowsInstance(id, res.title, res.database[1]));
  console.log('dbdata..........')
  return dbdata;
})
var checkUpdateData = async(function(id, data) {
  var sid = data[0].Schemaid
  var res = await (getSchemaData(sid))
  var old_data = await (getActualInstance(id, res))
  // console.log('old_data', data)
  // var new_data = 
  var _res = await ( compareData(id, old_data, data[0], res) ) 
  return _res
})

var compareData = async(function(id, old_data, new_data, res) {
  var new_status = await (checkFlagforGet(old_data))
  console.log('new_status...........................', new_status)
  if (!new_status) {
    // console.log('Here..................')
    var dbdata = await (updateData(id, new_data, res))
    return dbdata
  } else {
    // for(let [inxx, object] of new_data.entries()) {
    for (let sKey in old_data) {
      // console.log(object, sKey)
      if (Array.isArray(old_data[sKey])) {
        console.log('....................')
        // console.log(old_data[sKey], sKey)
        var entityType = await (FindEntitytype(sKey, res))
        // var database = await (giveDatabase(entityType))
        var _res = await (getSchemaData(entityType))
        // console.log('Database', _res)
        var flag = false
        for(let [inx, ent] of _res.entity.entries()) {
          if(ent.customtype) {
            flag = true
          }
        }

        if(!flag) {
          var s = []
          if(old_data[sKey].length == new_data[sKey].length) {
            for(let [i, sObj] of old_data[sKey].entries()) {
              // console.log(sObj.refid, new_data[sKey][i], _res)
              var n = await (updateData(sObj.refid, new_data[sKey][i], _res))
              s.push(n)
              new_data[sKey][i] = {}
              new_data[sKey][i].refid = sObj.refid
              // console.log(new_data[sKey][i])
              // new_data[sKey][i] = old_data[sKey][i]
            }
          } else if (old_data[sKey].length > new_data[sKey].length) {
            var s = []
            var diff = old_data[sKey].length - new_data[sKey].length
            var upLen = old_data[sKey].length - diff
            for(let i = 0; i < upLen; i++) {
              var n = await (updateData(old_data[sKey][i].refid, new_data[sKey][i], _res))
              s.push(n)
              new_data[sKey][i] = {}
              new_data[sKey][i].refid = old_data[sKey][i].refid
            }
            for(let j = upLen; j < old_data[sKey].length; j++) {
              var n = await (deleteData(old_data[sKey][j].refid, _res))
              s.push(n)
            }
          } else if (old_data[sKey].length < new_data[sKey].length) {
            for(let i = 0; i < old_data[sKey].length; i++) {
              var n = await (updateData(old_data[sKey][i].refid, new_data[sKey][i], _res))
              s.push(n)
              new_data[sKey][i] = {}
              new_data[sKey][i].refid = old_data[sKey][i].refid
            }
            for(let j = old_data[sKey].length; j < new_data[sKey].length; j++) {
              var sres = await (saveData(new_data[sKey][j], _res))
              new_data[sKey][j] = {}
              new_data[sKey][j].refid = sres
              s.push(n)
            }
          }
          // old_data[sKey] = s;
        } else {
          var s = []
          // console.log('/////////////////////////////////////////////////////////////////////////////////////', new_data[sKey])
          for(let [i, sObj] of old_data[sKey].entries()) {
            var oData = await (getActualInstance(sObj.refid, _res))
            var n = await (compareData(sObj.refid, oData, new_data[sKey][i], _res))
            new_data[sKey][i] = {}
            new_data[sKey][i].refid = sObj.refid
            s.push(n)
          }
        }
      }
    }
    // }
    var s = await (updateData (id, new_data, res))
    return s
  }
})
var singleLevelsave = async(function(data) {
  var id = data[0].Schemaid
  var res = await (getSchemaData(id))
  var arr = []
  for (let [inx, sObj] of data.entries()) {
    var _res = await (saveData(sObj, res))
    arr.push({ refid: _res })
  }
  return arr
})
// var filterInst = async(function(data, id) {
//   for (let [i, fObj] of data.entries()) {
//     if (fObj._id == id) {
//       for (let k in fObj) {
//         if (Array.isArray(fObj[k])) {
//           for (let [j, item] of fObj[k].entries()) {
//             fObj[k][j] = await (filterInst(data, item.refid))
//           }
//         } else {
//           return fObj
//         }
//       }
//     }
//   }
// })
var findAllInstance = async(function() {
  // var res = await (axios.get('http://' + config.get('host') + ':' + config.get('port') + '/schema'))
  var allschema = await (getallSchemaData())
  var Instance = []
  for (let [i, sObj] of allschema.entries()) {
    for (let [inx, apiObj] of dbapi.entries()) {
      if (apiObj.db == sObj.database[0]) {
        var _res = await (dbapi[inx].api.getflowsInstance(sObj.title, sObj.database[1]))
        Instance.push(_res)
      }
    }
  }
  // console.log(Instance)
  var Extract = []
  for (let [i, obj] of Instance.entries()) {
    // console.log(obj)
    for (let [inx, item] of obj.entries()) {
      Extract.push(obj[inx])
    }
  }
  var fExtract = []
  // Filter Only SchemaId Instances
  for(let [inz, idObj] of Extract.entries() ) {
    if(idObj.hasOwnProperty('Schemaid')) {
      fExtract.push(idObj)
    }
  }
  console.log('Extract', fExtract)

  for (let [inxx, mObj] of fExtract.entries() ) {
    fExtract[inxx] = await (getIdbySchemaId(mObj._id, mObj.Schemaid))
  }
  return fExtract
  // // var fIns = []
  // for (let [inx, fObj] of Extract.entries()) {
  //   // if (fObj.hasOwnProperty('Schemaid')) {
  //   for (let k in fObj) {
  //     if (Array.isArray(fObj[k])) {
  //       // console.log(fObj)
  //       for (let [j, item] of fObj[k].entries()) {
  //         // console.log()
  //         fObj[k][j] = await (filterInst(Extract, item.refid))
  //       }
  //     }
  //   }
  //   // }
  // }
  // return Extract
  //   // var instance = []
  //   // // console.log('dbapi', dbapi)
  //   // for (let [inx, mObj] of dbapi.entries()) {
  //   //   // console.log('\n???', Obj)
  //   //   var _res = await (mObj.api.getflowsInstance())
  //   //   // console.log('_res', _res)
  //   //   instance.push(_res)
  //   // }
  //   // var Extract = []
  //   // for (let [i, arr] of instance.entries()) {
  //   //   for (let [j, item] of instance[i].entries()) {
  //   //     Extract.push(item)
  //   //   }
  //   // }
  //   // return Extract
})

var getIdbySchemaId = async(function(id, schemaid) {
  // console.log(id, schemaid)
  var res = await (getSchemaData(schemaid))
  // console.log(res)
  for(let [i, db] of dbapi.entries()) {
    if (db.db == res.database[0]) {
      var _res = await (db.api.getThisflowsInstance(id, res.title, res.database[1]))
      // console.log('_res', _res)
      var status = false 
      for(let k in _res) {
        if(Array.isArray(_res[k])) {
          status = true
        }
      }
      if(!status) {
        return _res
      } else {
        for(let k in _res) {
          if(Array.isArray(_res[k])) {
            for(let [inx, iObj] of _res[k].entries()) {
              var _typeid = await (FindEntitytype(k, res))
              _res[k][inx] = await( getIdbySchemaId(iObj.refid, _typeid))
            }
          }
        }
        return _res
      }
    }
  }
})

var getIdbySchemaName = async( function(id, name) {
  var Schema = await (getallSchemaData())
  var Schemaid;
  for(let [i, obj] of Schema.entries()) {
    if( obj.title == name ) {
      Schemaid = obj._id
    }
  }
  var _res = await (getIdbySchemaId(id, Schemaid))
  return _res;
})
var removeIdbySchemaId = async (function (id, schemaid) {
   var res = await (getSchemaData(schemaid))
   var _res = await (deleteData(id, res))
   return _res
})
var removeIdbySchemaName = async( function(id, name) {
  var Schema = await (getallSchemaData())
  var Schemaid;
  for(let [i, obj] of Schema.entries()) {
    if( obj.title == name ) {
      Schemaid = obj._id
    }
  }
  var _res = await (removeIdbySchemaId(id, Schemaid))
  return _res;
})

class Service {
  constructor(options) {
    this.options = options || {};
  }
  find(params) {
    console.log('find feathers instance...');
    // var instance = []
    var s = findAllInstance()
    return Promise.resolve(s)
      // dbapi.forEach(function (db) {
      //   let _promise = new Promise((resolve, reject) => {
      //     db.api.getflowsInstance().then((data) => {
      //       resolve(data);
      //     })
      //   });
      //   instance.push(_promise)
      // });
      // var _data = Promise.all(instance).then(function (response) {
      //   var Extract = []
      //   // console.log(response)
      //   response.forEach(function (item) {
      //     item.forEach(function (result) {
      //       Extract.push(result)
      //     })
      //   })
      //   // console.log('..........', Extract)
      //   // for(let [i, obj] of Extract.entries()) {
      //   //   for(let k in obj) {
      //   //       if(k == 'database') {
      //   //       } 
      //   //       else {
      //   //           if(Array.isArray(obj[k])) {
      //   //               for(let [index, insideObj] of obj[k].entries()) {
      //   //                   obj[k][index] = getInstance(insideObj.refid)
      //   //               }
      //   //           }
      //   //       }
      //   //   }
      //   // }
      //   // console.log('Extract', Extract)
      //   Extract = getallInstance(Extract)
      //   return Promise.resolve(Extract).then(function(d){
      //     // console.log('Hieeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
      //     return d
      //   })
      // })
      // return _data
      // if (params.query.name == undefined) {
      //   var dbdata = dbapi.getflowsInstance();
      // }
      // if (params.query.name !== undefined) {
      //   var dbdata = dbapi.getSchemaName(params.query.name);
      // }
      // return Promise.resolve(dbdata);
  }
  get(id, params) {
    console.log('Get Instance feathers...');
    if (params.query.schemaid != undefined) {
      var res = getIdbySchemaId(id, params.query.schemaid)
      return Promise.resolve(res)
    } else if (params.query.schemaname != undefined) {
      var res = getIdbySchemaName(id, params.query.schemaname)
      return Promise.resolve(res)
    } else {
      return Promise.resolve('You Must Enter schemaid Or schemaname as parameter for result..')
    }
      // // dbapi.forEach(function (db) {
      // //   let _promise = new Promise((resolve, reject) => {
      // //     db.api.getThisflowsInstance(id).then((data) => {
      // //       resolve(data);
      // //     })
      // //   });
      // //   instance.push(_promise)
      // // });
      // if (params.query.Schemaid !== undefined) {
      //   var dbdata = getInstance(id, params.query.Schemaid)
      // } else {
      //   var dbdata = getInstance(id)
      // }
      // // console.log('dbdata....', dbdata)
      // return Promise.resolve(dbdata)
  }
  create(data, params) {
      console.log('.................................Create feathers...............................', data);
      var flag = false
        //var mainDt = data.data
      for (let value in data.data[0]) {
        // console.log(value)
        if (Array.isArray(data.data[0][value])) {
          // console.log(data[0][value])
          flag = true
        }
      }
      console.log('Flag create', flag)
      if (!flag) {
        // var response = saveData(data.data[0], 'single')
        // var _data = Promise.resolve(response).then(function(d) {
        //     console.log('response... ', d)
        //     var arr = []
        //     arr.push({refid: d})
        //     return arr
        // })
        // .catch(function(err){
        //     console.log('Error', err)
        // }) 
        // return _data
        // return saveData(data.data[0])
        var response = singleLevelsave(data.data)
        return Promise.resolve(response)
      } else {
        // var id = data.data[0].Schemaid
        // console.log('.............id ', id)
        // let _promise = new Promise((resolve, reject) => {
        //     getSchemaDataEnt(id).then((data) => {
        //         resolve(data);
        //     })
        // });
        var response = setData(data.data)
          // var response = checkDataObj(data.data)
        return Promise.resolve(response)
          // .then(function(d) {
          //     console.log('response... ', d)
          //     return d
          // })
          // .catch(function(err){
          //     console.log('Error', err)
          // }) 
      }
  }
    // create(data, params) {
    //   console.log('create feathers...');
    //   var _dbindex = _.findIndex(dbapi, { 'db': data.database[0]});
    //   // console.log('data', _dbindex, dbapi[0])
    //   var dbdata = dbapi[_dbindex].api.postflowsInstance(data);
    //   return Promise.resolve(dbdata);
    // }
  update(id, data, params) {
    console.log('-------------------------- Update Feathers Instacne ----------------------')
      // console.log('update ...', id, data)
    var response = checkUpdateData(id, data.data)
    return Promise.resolve(response)
      // var dbdata = dbapi.putflowsInstance(data, id);
      // return Promise.resolve(dbdata);
  }
  patch(id, data, params) {
    // var dbdata = dbapi.putSchema(data, id);
    return Promise.resolve(data);
  }
  remove(id, params) {
    if (params.query.schemaid != undefined) {
      var res = removeIdbySchemaId(id, params.query.schemaid)
      return Promise.resolve(res)
    } else if (params.query.schemaname != undefined) {
      var res = removeIdbySchemaName(id, params.query.schemaname)
      return Promise.resolve(res)
    } else {
      return Promise.resolve('You Must Enter schemaid Or schemaname as parameter for result..')
    }
    // var dbdata = dbapi.deleteThisflowsInstance(id);
    // return Promise.resolve(dbdata);
    // return Promise.resolve({ id });
  }
}
module.exports = function(options) {
  return new Service(options);
};
module.exports.Service = Service;