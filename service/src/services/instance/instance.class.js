/* eslint-disable no-unused-vars */
let async = require('asyncawait/async');
let await = require('asyncawait/await');
var axios = require('axios');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var db = '../DBConnection/db.json';
var file = require(db);
var dbapi = [];
_.forEach(file, function(dbs, i) {
  // console.log('dbs', dbs)
  _.forEach(dbs.dbinstance, function(instance) {
    // console.log(instance)
    if (instance.isenable) {
      // console.log('qqqq', instance.connection_name)
      var api = require('../DBConnection/' + i + 'api')
      dbapi.push({ db: i, api: api });
      api.choose()
    }
  })
})
var chokidar = require('chokidar');
let readfile = async(function() {
  fs.readFile(path.join(__dirname, '../DBConnection/db.json'), function(err, data) {
    if (err) return console.log(err);
    // console.log('reading file' + data)
    if (data == '') {
      console.log('BLANCK DATA');
      return 'nodata';
    }
    file = data;
    dbapi = [];
    _.forEach(file, function(dbs, i) {
      _.forEach(dbs.dbinstance, function(instance) {
        if (instance.isenable) {
          var api = require('../DBConnection/' + i + 'api')
          dbapi.push({ db: i, api: api });
          api.choose()
        }
      })
    })
  });
})
// One-liner for current directory, ignores .dotfiles 
chokidar.watch(path.join(__dirname, '../DBConnection/db.json'), { ignored: /(^|[\/\\])\../ }).on('change', async(function(path) {
  // console.log('File', path, 'has been changed');
  delete require.cache[require.resolve('../DBConnection/db')];
  delete require.cache[require.resolve('../DBConnection/mongoapi')];
  delete require.cache[require.resolve('../DBConnection/rethinkapi')];
  delete require.cache[require.resolve('../DBConnection/elasticapi')];
  var checking = await (readfile);
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
    // }))  
  return flag
})
var checkDataObj = async(function(data) {
  console.log("calling >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  for (let [dIndex, dObj] of data.entries()) {
    // console.log('.......', dIndex, dObj)
    for (let sKey in dObj) {
      // console.log('.....', sObj)
      if (sKey == 'database') {} else {
        if (Array.isArray(dObj[sKey])) {
          var status = await (checkFlag(dObj[sKey]))
            // console.log('Status of Array.............................', status)
          if (!status) {
            // console.log('Val....not contain any array.......')
            for (let [inx, obj] of dObj[sKey].entries()) {
              // console.log('........', dObj[sKey][inx], inx, obj)
              var objid = await (saveData(obj))
                // console.log('jjksjdfkldsssssssssssssssssss', typeof objid, objid)
              objid = objid.toString()
                // console.log('?????????????????????????/////', objid, typeof objid)
              for (let key in obj) {
                delete obj[key]
              }
              obj.refid = objid
            }
          } else {
            // console.log('....', dObj[Key]) 
            var resp = await (checkDataObj(dObj[sKey]))
            dObj[sKey] = resp
              // console.log('contain array...............recursive.....', resp)
          }
        }
      }
    }
  }
  for (let [inxx, object] of data.entries()) {
    // console.log('qqqqqqqqqqqqqqqqqqqqqqq', object)
    var id = await (saveData(object))
    id = id.toString()
    for (let okey in object) {
      delete object[okey]
    }
    object.refid = id
  }
  return data
})
var saveData = async(function(data) {
  console.log('save calling...................')
  var _dbindex = _.findIndex(dbapi, { 'db': data.database[0] });
  var dbdata = await (dbapi[_dbindex].api.postflowsInstance(data));
  console.log('Return Instance id .........', dbdata)
  return dbdata;
})
var getInstance = async(function(id) {
  var instance = []
  dbapi.forEach(function(db) {
    let _promise = new Promise((resolve, reject) => {
      db.api.getThisflowsInstance(id).then((data) => {
        resolve(data);
      })
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
    console.log(flag)
    if (!flag) {
      return obj
    } else {
      for (let okey in obj) {
        // console.log(okey, '=', obj[okey])
        if (okey == 'database') {} else {
          if (Array.isArray(obj[okey])) {
            for (let [index, insideObj] of obj[okey].entries()) {
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
  for (let [i, obj] of data.entries()) {
    for (let k in obj) {
      if (k == 'database') {} else {
        if (Array.isArray(obj[k])) {
          for (let [index, insideObj] of obj[k].entries()) {
            obj[k][index] = await (getInstance(insideObj.refid))
          }
        }
      }
    }
  }
  return data
})
class Service {
  constructor(options) {
    this.options = options || {};
  }
  find(params) {
    console.log('find feathers instance...');
    var instance = []
    dbapi.forEach(function(db) {
      let _promise = new Promise((resolve, reject) => {
        db.api.getflowsInstance().then((data) => {
          resolve(data);
        })
      });
      instance.push(_promise)
    });
    var _data = Promise.all(instance).then(function(response) {
      var Extract = []
        // console.log(response)
      response.forEach(function(item) {
          item.forEach(function(result) {
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
      console.log('Extract', Extract)
      Extract = getallInstance(Extract)
      return Promise.resolve(Extract).then(function(d) {
        console.log('Hieeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
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
    for (let value in data.data[0]) {
      if (value == 'database') {} else {
        if (Array.isArray(data.data[0][value])) {
          // console.log(data[0][value])
          flag = true
        }
      }
    }
    if (!flag) {
      return saveData(data.data[0])
    } else {
      var response = checkDataObj(data.data)
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
    var dbdata = dbapi.putflowsInstance(data, id);
    return Promise.resolve(dbdata);
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
module.exports = function(options) {
  return new Service(options);
};
module.exports.Service = Service;