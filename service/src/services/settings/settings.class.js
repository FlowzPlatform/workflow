/* eslint-disable no-unused-vars */
var express = require('express');
var path = require('path');
var CryptoJS = require("crypto-js");
let async = require('asyncawait/async');
let await = require('asyncawait/await');
// var db = require('../DBConnection/db');
var fileName = '../DBConnection/db.json';
var fs = require('fs');
var jsonfile = require('jsonfile')
var _ = require('lodash')
var endecrypt = require('../encryption/security')

// check_Connection
var mongodb = require('mongodb');
var elasticsearch = require('elasticsearch');
var MongoClient = require('mongodb').MongoClient;

var check_Connection = async(function (db, data) {
  // console.log('data..', data, 'db', db)
  if (db == 'mongo') {
    console.log("MongoDB..............");
    var _res;
    if (data.username != undefined && data.password != undefined) {
      // console.log('.............')
      if (data.username != "" && data.password != "") {
        _res = await (MongoClient.connect('mongodb://' + data.username + ':' + data.password + '@' + data.host + ':' + data.port + '/' + data.dbname))
      } else {
        _res = await (MongoClient.connect('mongodb://' + data.host + ':' + data.port + '/' + data.dbname))
      }
    } else {
      // console.log('.............111')
      if (data.dbname != undefined) {} else {
        _res = await (MongoClient.connect('mongodb://' + data.host + ':' + data.port))
      }
    }
    return _res
  } else if (db == 'rethink') {
    // console.log("RethinkDB..............");
    var r = await (require('rethinkdbdash')({
      username: data.username,
      password: data.password,
      port: data.port,
      host: data.host,
      db: data.dbname
    }).connect({
      username: data.username,
      password: data.password,
      port: data.port,
      host: data.host,
      db: data.dbname
    }))
    return r
  }
  // console.log('response>>>>>>>>>>>>', _res)
  // , function(err, database) {
  // if(err){
  //   console.log('err', err)
  //   return 'false'
  // }
  // else {
  // console.log('Mongo connected....',database);
  //   return 'true'
  // }
  // });
  else if (db == 'rethink') {
    // console.log("RethinkDB..............");
    var r = await (require('rethinkdbdash')({
      username: data.username,
      password: data.password,
      port: data.port,
      host: data.host,
      db: data.dbname
    }).connect({
      username: data.username,
      password: data.password,
      port: data.port,
      host: data.host,
      db: data.dbname
    }))
    return r
      // ,function(err,response){
      //   if(err){
      //     console.log('XXXXXXXXXXXXXXXXXXXXXXXXX',err);
      //     return 'false'
      //   }
      //   else {
      //     console.log('EEEEEEEEEEEEEEEEEEEEEEEEEEE',response);
      //    return'true'
      //   }
      // })
  } else if (db == 'elastic') {
    // console.log("Elastic Search..............");
    var client = await (new elasticsearch.Client({
        host: data.host + ':' + data.port,
        log: 'error'
      }).ping({
        requestTimeout: 1000
      }))
      // console.log(client)
    return client
      // , function (error) {
      //   if (error) {
      //     return 'false'
      //   } else {
      //     return 'true'
      //   }
      // });
  } else if (db == 'mysql') {
    return 'success'
  } else {
    var _res = new error()
    return _res
  }
})

var getConnectionData = async(function (db, data) {
  // console.log('getConnectionData..............')
  if (db == 'mongo') {
    var mongoDB;
    if (data.username != "" && data.password != "") {
      mongoDB = 'mongodb://' + data.username + ':' + data.password + '@' + data.host + ':' + data.port + '/' + data.dbname;
    } else {
      mongoDB = 'mongodb://' + data.host + ':' + data.port + '/' + data.dbname;
    }
    var conn = await (MongoClient.connect(mongoDB))
      // console.log('conn', conn);
      // var collections = await (conn.listCollections().toArray());
      // console.log('collections', collections)

    var result = await (conn.listCollections().toArray())
    for (let [inx, obj] of result.entries()) {
      for (let k in obj) {
        if (k !== 'name') {
          delete obj[k]
        }
        var a = await (conn.collection(obj.name).find().toArray())
        var cols =[]
        if(a[0] != undefined) {
          for(let k in a[0]) {
            cols.push({name: k})
          }
        }
      }
      result[inx].columns = cols; 
    }
    // console.log('Data........................', result)
    return result
  } else if (db == 'rethink') {
    // console.log('match found rethink')
    var connection = require('rethinkdbdash')({
      username: data.username,
      password: data.password,
      port: data.port,
      host: data.host,
      db: data.dbname
    });
    // console.log('conn.......', connection)
    // var result = await (connection.table('schema').run())
    var result = await (connection.db(data.dbname).tableList())
    for (let [inx, val] of result.entries()) {
      var a = await (connection.db(data.dbname).table(val).run())
      var cols =[]
      if(a[0] != undefined) {
        for(let k in a[0]) {
          cols.push({name: k})
        }
      }
      result[inx] = { name: val, columns: cols}
    }
    // console.log('result............', result)
    return result
  } else if (db == 'elastic') {
    // console.log('match found rethink')
    var connection = new elasticsearch.Client({
      host: data.host + ':' + data.port + '/' + data.dbname
    });
    var data1 = [];
    var result = await (
      connection.search({
        body: {
          aggs: {
            typesAgg: {
              terms: {
                field: '_type',
                size: 200
              }
            }
          },
          size: 0
        }
      }))
    var conn = new elasticsearch.Client({
      host: data.host + ':' + data.port
    });
    // console.log('result........', result.aggregations.typesAgg.buckets)
    for (let [i, obj] of result.aggregations.typesAgg.buckets.entries()) {
      // var mapping = await (
      //     conn.indices.getMapping({
      //       index: data.dbname,
      //       type: obj.key
      //     }))
      //   console.log('..............', mapping[data.dbname].mappings[obj.key].properties)
      // data1.push({ name: obj.key, columns: mapping[data.dbname].mappings[obj.key].properties })
      var data = []
      var a = await (connection.search({
          index: data.dbname,
          type: obj.key,
          body: {
              query: {
                  match_all: { }
              },
          }
      }))
      a.hits.hits.forEach(function(hit){
        var item =  hit._source;
        item._id = hit._id;
        data.push(item);
    })
      var cols =[]
      if(data[0] != undefined) {
        for(let k in data[0]) {
          cols.push({name: k})
        }
      }
      // result[inx] = { name: val, columns: cols}
      data1.push({ name: obj.key, columns: cols })
    }
    // console.log(data1)
    return data1;
  } else if (db == 'mysql') {
    var s = []
    return s
  } else {
    return 'not_found_db'
  }
})

var getAllSettings = async(function () {
  let result = new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '../DBConnection/db.json'), function (err, data) {
      if (err) return console.log(err);
      resolve(JSON.parse(data));
    });
  });
  var _data = Promise.resolve(result).then(function (dbdata) {
    // console.log(dbdata)
    _.forEach(dbdata, function (instances, db) {
      // console.log(instances)
      _.forEach(instances.dbinstance, function (item, i) {
        // console.log(dbdata[db].dbinstance[i])
        delete dbdata[db].dbinstance[i].username
        delete dbdata[db].dbinstance[i].password
      })
    })
    return dbdata
  });
  return _data
})

var getDbInstances = async(function (dbname) {
  var _res = await (getAllSettings())
  var instances;
  for (let db in _res) {
    if (db == dbname) {
      instances = _res[db].dbinstance
        // console.log(_res[db].dbinstance)
    }
  }
  return instances
})

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    if (params.query.dbname != undefined) {
      var _res = getDbInstances(params.query.dbname)
      return Promise.resolve(_res)
    } else {
      var _res = getAllSettings()
      return Promise.resolve(_res)
    }
    // let result = new Promise((resolve, reject) => {
    //     fs.readFile(path.join(__dirname, '../DBConnection/db.json'),function (err, data) {
    //       if (err) return console.log(err);
    //           resolve(JSON.parse(data));
    //       });
    // });
    // var _data = Promise.resolve(result).then(function(dbdata){
    //     // console.log(dbdata)
    //     _.forEach(dbdata, function(instances, db){
    //         // console.log(instances)
    //         _.forEach(instances.dbinstance, function(item, i){
    //             // console.log(dbdata[db].dbinstance[i])
    //             delete dbdata[db].dbinstance[i].username
    //             delete dbdata[db].dbinstance[i].password
    //         })
    //     })
    //     return dbdata
    // });
    // return _data
  }

  get(id, params) {
    let result = new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '../DBConnection/db.json'), function (err, data) {
        if (err) return console.log(err);
        resolve(JSON.parse(data));
      });
    });
    var _data = Promise.resolve(result).then(function (dbdata) {
      // console.log(dbdata)
      var instance;
      _.forEach(dbdata, function (instances, db) {
        var obj = _.find(instances.dbinstance, { id: id })
        if (obj != undefined) {
          instance = obj
          instance.selectedDb = db
        }
      })
      return instance
    });
    return _data
  }

  create(data, params) {
    console.log('********* Inside Create Service *********\n');
    if (params.query.check != undefined) {
      if (params.query.check == 'mysql') {
        return Promise.resolve({ result: true, data: [] })
      } else {
        var _res = check_Connection(params.query.check, data)
        return Promise.resolve(_res).then(function (res) {
            // console.log('result.................', res)
            var abc = getConnectionData(params.query.check, data)
            return Promise.resolve(abc).then(function (__res) {
                return { result: true, data: __res }
              })
              // return {result: true}
          })
          .catch(function (err) {
            // console.log('Error..............', err)
            return { result: false }
          })
      }
    } else {
      if (params.query.checkconn != undefined) {
        var _res = check_Connection(params.query.checkconn, data)
        return Promise.resolve(_res).then(function (res) {
          return { result: true }
        }).catch(function (err) {
          // console.log('Error..............', err)
          return { result: false }
        })
      } else {
        //encryption
        data.password = endecrypt.encrypt(data.password);
        // console.log(data)
        let result = new Promise((resolve, reject) => {
          fs.readFile(path.join(__dirname, '../DBConnection/db.json'), function (err, data) {
            if (err) return console.log(err);
            resolve(JSON.parse(data));
          });
        });
        var _data = Promise.resolve(result).then(function (res) {
          var selectDB = data.selectedDb;
          delete data.selectedDb;

          //check connection alredy exist or not
          var check = ''
          _.map(res[selectDB].dbinstance, function (instance) {
            if (instance.host == data.host && instance.port == data.port && instance.dbname == data.dbname) {
              check = 'Exist'
            }
          })
          if (check == 'Exist') {
            return 'Exist'
          } else {
            //check connection is isdefault true
            if (data.isdefault) {
              _.forEach(res, (v, k) => {
                _.forEach(res[k].dbinstance, function (inst) {
                  inst.isdefault = false
                })
              })
            }
            // console.log(res[selectDB].dbinstance)
            res[selectDB].dbinstance.push(data)
            let result1 = new Promise((resolve, reject) => {
              jsonfile.writeFile(path.join(__dirname, '../DBConnection/db.json'), res, { spaces: 4 }, function (err) {
                if (err) return 'Error';
                resolve(res);
              });
            });
            Promise.resolve(result1);
            return 'Success'
          }
        });
        return _data;
      }
    }
  }

  update(id, data, params) {
    console.log('Inside Update Settings...')
    var updatedb = params.query.db
    let result = new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '../DBConnection/db.json'), function (err, data) {
        if (err) return console.log(err);
        resolve(JSON.parse(data));
      });
    });
    var _data = Promise.resolve(result).then(function (res) {
      var index_instance = _.findKey(res[updatedb].dbinstance, { id: id });
      // console.log('instance', index_instance)
      res[updatedb].dbinstance[index_instance].isenable = data.isenable
      let result1 = new Promise((resolve, reject) => {
        jsonfile.writeFile(path.join(__dirname, '../DBConnection/db.json'), res, { spaces: 4 }, function (err) {
          if (err) return 'Error';
          resolve(res);
        });
      });
      return Promise.resolve(result1);
    });
    return _data;
  }

  patch(id, data, params) {
    console.log('Inside patch Settings...')
    var updatedb = params.query.db
    let result = new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '../DBConnection/db.json'), function (err, data) {
        if (err) return console.log(err);
        resolve(JSON.parse(data));
      });
    });
    var _data = Promise.resolve(result).then(function (res) {
      var index_instance = _.findKey(res[updatedb].dbinstance, { id: id });
      // console.log('instance', index_instance)
      for (let db in res) {
        for (let [inx, inst] of res[db].dbinstance.entries()) {
          inst.isdefault = false
        }
      }
      res[updatedb].dbinstance[index_instance].isdefault = data.isdefault
      let result1 = new Promise((resolve, reject) => {
        jsonfile.writeFile(path.join(__dirname, '../DBConnection/db.json'), res, { spaces: 4 }, function (err) {
          if (err) return 'Error';
          resolve(res);
        });
      });
      return Promise.resolve(result1);
    });
    return _data;
  }

  remove(id, params) {
    console.log('Inside Delete Settings...')
    var updatedb = params.query.db
    let result = new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '../DBConnection/db.json'), function (err, data) {
        if (err) return console.log(err);
        resolve(JSON.parse(data));
      });
    });
    var _data = Promise.resolve(result).then(function (res) {
      var index_instance = _.findKey(res[updatedb].dbinstance, { id: id });
      // console.log('instance', index_instance)
      res[updatedb].dbinstance.splice(index_instance, 1)
      let result1 = new Promise((resolve, reject) => {
        jsonfile.writeFile(path.join(__dirname, '../DBConnection/db.json'), res, { spaces: 4 }, function (err) {
          if (err) return 'Error';
          resolve(res);
        });
      });
      return Promise.resolve(result1);
    });
    return _data;
    // return Promise.resolve({ id });
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
