/* eslint-disable no-unused-vars */
let async = require('asyncawait/async');
let await = require('asyncawait/await');
let config = require('config');
var axios = require('axios');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var db = '../DBConnection/db.json';
var file = require(db);
var dbapi = []; 
let postSchemaData;
let putSchemaData;

// console.log('config', config.get('host'))
_.forEach(file, function (dbs, i) {
  var flag = false
  _.forEach(dbs.dbinstance, function(instance) {
    if (instance.isenable) {
      flag = true
    }
  })
  if(flag) {
    var api = require('../DBConnection/' + i + 'api')
    dbapi.push({ db: i, api: api });
    api.choose()
  }
})

var chokidar = require('chokidar');

let readfile = async(function () {
  fs.readFile(path.join(__dirname, '../DBConnection/db.json'), function (err, data) {
    if (err) return console.log(err);
    // console.log('reading file' + data)
    if (data == '') {
      console.log('BLANCK DATA');
      return 'nodata';
    }
    file = data;
    dbapi = [];
    _.forEach(file, function (dbs, i) {
      var flag = false
      _.forEach(dbs.dbinstance, function(instance) {
        if (instance.isenable) {
          flag = true
        }
      })
      if(flag) {
        var api = require('../DBConnection/' + i + 'api')
        dbapi.push({ db: i, api: api });
        api.choose()
      }
    })
  });
})

// One-liner for current directory, ignores .dotfiles 
chokidar.watch(path.join(__dirname, '../DBConnection/db.json'), { ignored: /(^|[\/\\])\../ }).on('change', async(function (path) {
  // console.log('File', path, 'has been changed');
  delete require.cache[require.resolve('../DBConnection/db')];
  delete require.cache[require.resolve('../DBConnection/mongoapi')];
  delete require.cache[require.resolve('../DBConnection/rethinkapi')];
  delete require.cache[require.resolve('../DBConnection/elasticapi')];
  delete require.cache[require.resolve('../DBConnection/mysqlapi')];    

  var checking = await(readfile);
  if(checking == 'nodata'){
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ from instance');
    await(readfile);
  }
}))


var checkFlag = async (function(data) {
    var flag = false
    _.forEach(data, async(function(obj, index){
        // console.log('Obj', obj, '..k..', k)la
        _.forEach(obj, async(function(val, key){
            // console.log(key, val)
            if (key == 'database') {}
            else {
                if (Array.isArray(val)) {
                    _.forEach(val, async(function(obj) {
                        if(!obj.hasOwnProperty('refid')) {
                            flag = true
                        }
                    })) 
                }
            }
        }))
    }))  
    return flag
})

var checkFlagforGet = async (function(mObj) {
    var flag = false
    // _.forEach(data, async(function(obj, index){
        // console.log('Obj', obj, '..k..', k)la
        _.forEach(mObj, async(function(val, key){
            // console.log(key, val)
            if (key == 'database') {}
            else {
                if (Array.isArray(val)) {
                    _.forEach(val, async(function(obj) {
                        if(obj.hasOwnProperty('refid')) {
                            flag = true
                        }
                    })) 
                }
            }
        }))
    // }))  
    return flag
})

var checkDataObj = async (function(data, id, res) {
    console.log("calling >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    for(let [dIndex, dObj] of data.entries()){
        // if(dObj.hasOwnProperty('Schemaid')) {
        //   // console.log('{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{')
        //   var a = await (setSchemaData(dObj.Schemaid))
        //   // console.log('}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}', a)
        // }
        // console.log('.......', dIndex, dObj)
        for(let sKey in dObj){
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
                        var entityType = await(FindEntitytype(sKey, res))
                        var _res = await (getSchemaData(entityType))
                        // console.log('_res', _res, '\nres...', res)
                        for(let [inx , obj] of dObj[sKey].entries()){
                          // console.log('?????????????????????????', sKey)
                          var s = false
                          for(let k in obj) {
                            if(Array.isArray(obj[k])){
                              s = true
                            }
                          }
                          if(!s) {
                            console.log('<<<<<<<<<<<<<', _res)
                            objid = await (saveData(obj, _res.database))
                          }
                          else {
                            console.log('@@@@.............', res)
                            objid = await (saveData(obj, res.database))
                          }
                          // console.log('res=====================================', res)
                            // var objid = await (saveData(obj, res.database))
                            // console.log('jjksjdfkldsssssssssssssssssss', typeof objid, objid)
                            objid = objid.toString()
                            // console.log('?????????????????????????/////', objid, typeof objid)
                            for(let key in obj) {
                                delete obj[key]
                            }
                            obj.refid = objid
                        }
                    }
                    else {
                        // console.log('..::::::::::::::::::..', dObj[sKey], sKey, dObj) 
                        var entityType = await(FindEntitytype(sKey, res))
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

    for(let [inxx, object] of data.entries()){
      // console.log('>>>>>>>>>>>>>>> ', res)
        var id = await (saveData(object, res.database))
        id = id.toString()
        for(let okey in object) {
            delete object[okey]
        }
        object.refid = id
        // console.log('qqqqqqqqqqqqqqqqqqqqqqq', object)
    }
    return data
})

var FindEntitytype = async(function(fieldname, data) {
  // console.log('FindEntitytype :::::::::::', fieldname)
  for(let [inxx, object] of data.entity.entries()) {
      // console.log('?///////////////', object)
    
    if (object.name == fieldname) {
      return object.type
    }
    // console.log('...', object, inxx)
  }
})

var setSchemaData = async(function(id) {
  // console.log('setSchemaData calling >>>>>>>>>>>')
  var res = await (axios.get('http://'+config.get('host')+':'+config.get('port')+'/schema/'+id))
  postSchemaData = res.data 
  return 'set'
})

var getSchemaData = async(function(id) {
  // console.log('setSchemaData calling >>>>>>>>>>>')
  var res = await (axios.get('http://'+config.get('host')+':'+config.get('port')+'/schema/'+id))
  // console.log('res', res)
  // postSchemaData = res.data 
  return res.data
})

var giveDatabase = async(function(schemaid) {
  var res = await (axios.get('http://'+config.get('host')+':'+config.get('port')+'/schema/'+schemaid))
  console.log('response from giveDatabase', res.data)
  // postSchemaData = res.data 
  return res.data.database
})

var saveData = async (function(data, database) {
    console.log('save calling...................', data, database)
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
    var _dbindex = _.findIndex(dbapi, { 'db': database[0]});
    var dbdata = await (dbapi[_dbindex].api.postflowsInstance(data, database[1]));
    console.log('Return Instance id .........', dbdata)
    return dbdata;
})

var setData = async(function(data) {
  // console.log('????????????????????????????????????????')
  var id = data[0].Schemaid
  var res = await (getSchemaData(id))
  // console.log('entity???????????', res)
  // console.log('id.............', id)
  var res = await (checkDataObj(data, id, res))
  return res
})

var getInstance = async( function(id) {
    var instance = []
    dbapi.forEach(function (db) {
        let _promise = new Promise((resolve, reject) => {
            db.api.getThisflowsInstance(id).then((data) => {
                resolve(data);
            })
        });
        instance.push(_promise)
      });
    // }
    var _data = Promise.all(instance).then(async (function (response) {
        var obj;
        response.forEach(function (item) {
            if (item[0] != undefined) {
                obj = item[0]
            }
        })
        // console.log('????????????????????', obj)
        var flag = await (checkFlagforGet(obj))
        // console.log(flag)
        if(!flag) {
            return obj
        }
        else {
            for(let okey in obj) {
                // console.log(okey, '=', obj[okey])
                if (okey == 'database') {
                }
                else {
                    if (Array.isArray(obj[okey])) {
                        for(let [index, insideObj] of obj[okey].entries()) {
                            // console.log('111111111111111111111111111111111', insideObj)
                            obj[okey][index] = await (getInstance(insideObj.refid))
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
    for(let [i, obj] of data.entries()) {
        for(let k in obj) {
            if(k == 'database') {
            } 
            else {
                if(Array.isArray(obj[k])) {
                    for(let [index, insideObj] of obj[k].entries()) {
                        obj[k][index] = await (getInstance(insideObj.refid))
                    }
                }
            }
        }
      }
      return data
})

var getActualInstance = async(function(id) {
    var instance = []
    dbapi.forEach(function (db) {
        let _promise = new Promise((resolve, reject) => {
            db.api.getThisflowsInstance(id).then((data) => {
                resolve(data);
            })
        });
        instance.push(_promise)
      });
    // }
    var _data = Promise.all(instance).then(async (function (response) {
        var obj;
        response.forEach(function (item) {
            if (item[0] != undefined) {
                obj = item[0]
            }
        })
        // console.log('????????????????????', obj)
        // var flag = await (checkFlagforGet(obj))
        // console.log(flag)
        // if(!flag) {
        //     return obj
        // }
        // else {
        //     for(let okey in obj) {
        //         // console.log(okey, '=', obj[okey])
        //         if (okey == 'database') {
        //         }
        //         else {
        //             if (Array.isArray(obj[okey])) {
        //                 for(let [index, insideObj] of obj[okey].entries()) {
        //                     // console.log('111111111111111111111111111111111', insideObj)
        //                     obj[okey][index] = await (getInstance(insideObj.refid))
        //                     // console.log('222222222222222222222222222222222', obj[okey][index], insideObj)
        //                 }
        //             }
        //         } 
        //     }
        //     return obj
        return obj
        // }
    }))
    return _data;
})

var updateData = async (function(id, data, dbid) {
})

var checkUpdateData = async(function(id, new_data) {
  // console.log('updateData,,,,', id, data)
  // if(new_data[0].hasOwnProperty(Schemaid)) {
    var res = await (axios.get('http://'+config.get('host')+':'+config.get('port')+'/schema/'+new_data[0].Schemaid))
    putSchemaData = res.data
  // }
  // console.log('putSchemaData', putSchemaData.data)
  var old_data = await (getActualInstance(id))
  // console.log('getActualInstance old_data', old_data)
  var res = await (compareData(id, old_data, new_data))
  return res
})

var compareData = async(function(id, old_data, new_data) {
  var new_status = await (checkFlagforGet(old_data))
  console.log('new_status', new_status, old_data)
  if(!new_status) {
    // console.log('Here..................')
    var _dbindex = _.findIndex(dbapi, { 'db': putSchemaData.database[0]});
    var dbdata = await (dbapi[_dbindex].api.putflowsInstance(new_data[0], id, putSchemaData.database[1]));
    return dbdata
  } else {
    // for(let [inxx, object] of new_data.entries()) {
      for(let sKey in old_data) {
        // console.log(object, sKey)
        if(Array.isArray(old_data[sKey])) {
          console.log('....................')
          console.log(old_data[sKey], sKey)
          var entityType = await(FindEntitytype(sKey, putSchemaData))
          var database = await (giveDatabase(entityType))
          console.log('Database', database)
          for(let [i, sObj] of old_data[sKey].entries()) {
            var _dbindex = _.findIndex(dbapi, { 'db': database[0]});
            var dbdata = await (dbapi[_dbindex].api.putflowsInstance(new_data[0][sKey][i], sObj.refid, database[1]))
          }
          // var status = await (checkFlagforGet(object[sKey]))
          // if(!status) {
          //   console.log('Hieeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
          //   for (let sObj in object[sKey]) {
          //     console.log('sKey', sKey)
          //     // var _dbindex = _.findIndex(dbapi, { 'db': putSchemaData.database[0]});
          //     // var dbdata = await (dbapi[_dbindex].api.putflowsInstance(new_data[0], sObj.refid, putSchemaData.database[1]));
          //   }
          // } else {

          // }
        }
      }
    // }
    return 'refid'
  }
})

var singleLevelsave = async(function(data) {
  var id = data[0].Schemaid
  var res = await (getSchemaData(id))
  var arr = []
  for(let [inx, sObj] of data.entries()) {
    var _res = await (saveData(sObj, res.database))
    arr.push({refid: _res})
  }
  return arr
}) 


class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    console.log('find feathers instance...');
    var instance = []
    dbapi.forEach(function (db) {
      let _promise = new Promise((resolve, reject) => {
        db.api.getflowsInstance().then((data) => {
          resolve(data);
        })
      });
      instance.push(_promise)
    });

    var _data = Promise.all(instance).then(function (response) {
      var Extract = []
      // console.log(response)
      response.forEach(function (item) {
        item.forEach(function (result) {
          Extract.push(result)
        })
      })
      // console.log('..........', Extract)
      // for(let [i, obj] of Extract.entries()) {
      //   for(let k in obj) {
      //       if(k == 'database') {
      //       } 
      //       else {
      //           if(Array.isArray(obj[k])) {
      //               for(let [index, insideObj] of obj[k].entries()) {
      //                   obj[k][index] = getInstance(insideObj.refid)
      //               }
      //           }
      //       }
      //   }
      // }
      // console.log('Extract', Extract)
      Extract = getallInstance(Extract)
      return Promise.resolve(Extract).then(function(d){
        // console.log('Hieeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
        return d
      })
    })
    return _data
    // if (params.query.name == undefined) {
    //   var dbdata = dbapi.getflowsInstance();
    // }
    // if (params.query.name !== undefined) {
    //   var dbdata = dbapi.getSchemaName(params.query.name);
    // }
    // return Promise.resolve(dbdata);
  }

  get(id, params) {
    console.log('Get feathers...');
    var instance = []
    if (params.query.type !== undefined) {
      var dbdata = dbapi.getThisSchemaType(id, params.query.type)
    } else if (params.query.fieldname !== undefined) {
      var dbdata = dbapi.getThisSchemaFieldName(id, params.query.fieldname)
    } else {
      // dbapi.forEach(function (db) {
      //   let _promise = new Promise((resolve, reject) => {
      //     db.api.getThisflowsInstance(id).then((data) => {
      //       resolve(data);
      //     })
      //   });
      //   instance.push(_promise)
      // });
      var dbdata = getInstance(id)
      // console.log('dbdata....', dbdata)
      return Promise.resolve(dbdata)
        // .then(function(d) {
        //     console.log('response... ', d)
        //     return d
        // })
        // .catch(function(err){
        //     console.log('Error', err)
        // }) 
    }
    // var _data = Promise.all(instance).then(function (response) {
    //   var obj;
    //   response.forEach(function (item) {
    //     if (item[0] != undefined) {
    //       obj = item[0]
    //     }
    //   })
    //   return obj
    // })
    // return _data;
    // if (params.query.type !== undefined) {
    //   var dbdata = dbapi.getThisSchemaType(id, params.query.type)
    // } else if (params.query.fieldname !== undefined) {
    //   var dbdata = dbapi.getThisSchemaFieldName(id, params.query.fieldname)
    // } else {
    //   var dbdata = dbapi.getThisflowsInstance(id);
    // }
    // return Promise.resolve(dbdata);
  }

  create(data, params) {
    console.log('.................................Create feathers...............................');
    var flag = false
    //var mainDt = data.data
    for(let value in data.data[0]) {
        // console.log(value)
        if(Array.isArray(data.data[0][value])){
            // console.log(data[0][value])
            flag = true
        }
    }
    // console.log('Flag create', flag)
    if(!flag) {
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
    }
    else {
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
    var dbdata = dbapi.deleteThisflowsInstance(id);
    return Promise.resolve(dbdata);
    // return Promise.resolve({ id });
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
