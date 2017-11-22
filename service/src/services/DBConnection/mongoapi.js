var mongoose = require('mongoose');
let _ = require('lodash');
var db1 = require('./db');
let async = require('asyncawait/async');
let await = require('asyncawait/await');
var endecrypt = require('../encryption/security')
var db = [];
var defaultDb = []

db1.mongo.dbinstance.forEach(function (instance, inx) {
  if (instance.isenable) {
    // console.log('instance', instance)
    var pass = endecrypt.decrypt(instance.password)
      // console.log(pass)
    var mongoDB = 'mongodb://' + instance.username + ':' + pass + '@' + instance.host + ':' + instance.port + '/' + instance.dbname;
    // var mongoDB = 'mongodb://'+instance.host+':'+instance.port+'/'+((instance.dbname == '') ? databasename : instance.dbname);
    console.log('database::::', mongoDB);
    var connection = mongoose.createConnection(mongoDB);
    connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

    db.push({ id: instance.id, conn: connection })
  }
  if (instance.isdefault) {
    // console.log('instance', instance)
    var pass = endecrypt.decrypt(instance.password)
      // console.log(pass)
    var mongoDB = 'mongodb://' + instance.username + ':' + pass + '@' + instance.host + ':' + instance.port + '/' + instance.dbname;
    // var mongoDB = 'mongodb://'+instance.host+':'+instance.port+'/'+((instance.dbname == '') ? databasename : instance.dbname);
    console.log('database::::', mongoDB);
    var connection = mongoose.createConnection(mongoDB);
    connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

    defaultDb.push({ id: instance.id, conn: connection })
  }
})

// db1.mongo.username+':'+db1.mongo.password+'@'+
// var mongoDB = 'mongodb://'+db1.mongo.host+':'+db1.mongo.port+'/'+((db1.mongo.dbname == '') ? databasename : db1.mongo.dbname);
// var mongoDB = 'mongodb://localhost:27017,172.16.230.87:27017,172.16.160.117:27017/schema_builder?replicaSet=rs0&ssl=true&poolSize=10&authSource=admin&';

// console.log('database::::',mongoDB);

// console.log('-----',mongoose.connection.readyState);
// if(mongoose.connection.readyState >0){
//  mongoose.disconnect();
// }
// mongoose.connect(mongoDB);
// db = mongoose.connection;

// mongoose.connect(mongoDB);
// db = mongoose.createConnection(mongoDB);
// console.log("---------db----------",db);
// console.log('-----after---',mongoose.connection.readyState);
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// console.log('Success!!!!!!!!!!!!! Mongo');

module.exports = {
  generateInstanceTable: async(function (ins_id, title){
    console.log('Mongo generate instance collection..........', ins_id, title);
    // for(let [i, db_i] of db.entries()) {
    //   if(db_i.id == ins_id) {
    //     console.log(db[i].conn)
    //     var res = await (db[i].conn.createCollection(title))
    //     console.log('res......generateInstanceTable........', res)
    //     return res
    //   }
    // }
    return 'success'
  }),

  choose: async(function () {
    console.log('===================MONGODB=================');
  }),
  //get methods
  getSchemaName: async(function (name) {
    console.log('mongo get SchemaName.............................');
    var schemadata = async(function () {
      var result = []
      _.forEach(db, function (dbinstance) {
        var r = await (dbinstance.conn.collection('schema').find({ title: name }).toArray())
        _.forEach(r, function (instance) {
          result.push(instance)
        })
      })
      return result;
    });
    var res = await (schemadata())
      // console.log('schemadata getSchema',res);
    return res;
    // var schemadata = await (db.collection('schema').find({ title: name }).toArray());
    // // console.log('SchemaName',schemadata);
    // return schemadata;
  }),

  getThisSchemaType: async(function (id, type) {
    console.log('mongo get SchemaCurrent Type', type);
    if (id.length != 24) {
      return [];
    } else {
      var id = new mongoose.Types.ObjectId(id);
      // // console.log('mongo get SchemaCurrent id:',id);           {$and: [{_id: id}, {type: type}]}
      // var schemadata = await (db.collection('schema').find({ _id: id }, { _id: 0, title: 0, templateType: 0, template: 0 }).toArray());
      // // console.log('SchemaCurrent',schemadata[0].entity);
      // var result = [];
      // schemadata[0].entity.forEach(function (item, i) {
      //   // console.log('item---',item);
      //   if (item.type === type) {
      //     result.push(item);
      //   }
      // });
      // return result;
      var schemadata = async(function () {
        var result = []
        _.forEach(db, function (dbinstance) {
          var r = await (dbinstance.conn.collection('schema').find({ _id: id }).toArray())
          // console.log('rrrrrrrrrrrrrrrrrrrrrrrrrr', r)
          _.forEach(r, function (instance) {
            result.push(instance)
          })
        })
        return result;
      });
      var res = await (schemadata())
      console.log('item---',res);
      var result = [];
      res[0].entity.forEach(function (item, i) {
        if (item.type === type) {
          result.push(item);
        }
      });
      return result;
      // return res;
    }
  }),

  getThisSchemaFieldName: async(function (id, fieldname) {
    console.log('mongo get SchemaCurrent fieldname');
    if (id.length != 24) {
      return [];
    } else {
      var id = new mongoose.Types.ObjectId(id);
      // // console.log('mongo get SchemaCurrent id:',id);           {$and: [{_id: id}, {type: type}]}
      // var schemadata = await (db.collection('schema').find({ _id: id }, { _id: 0, title: 0, templateType: 0, template: 0 }).toArray());
      // // console.log('SchemaCurrent',schemadata[0].entity);
      // var result = [];
      // schemadata[0].entity.forEach(function (item, i) {
      //   // console.log('item---',item);
      //   if (item.name === fieldname) {
      //     result.push(item);
      //   }
      // });
      // return result;
      var schemadata = async(function () {
        var result = []
        _.forEach(db, function (dbinstance) {
          // console.log('rrrrrrrrrrrrrrrrrrrrrrrrrr', dbinstance)
          var r = await (dbinstance.conn.collection('schema').find({ _id: id }).toArray())
          _.forEach(r, function (instance) {
            result.push(instance)
          })
        })
        return result;
      });
      var res = await (schemadata())
        console.log('schemadata getSchema',res);
      var result = [];
      res[0].entity.forEach(function (item, i) {
        // console.log('item---',item);
        if (item.name === fieldname) {
          result.push(item);
        }
      });
      return result;
      // return res;
    }
  }),

  getSchemaByDbid: async(function(dbid) {
    console.log('mongo get Schema By dbid...........................');
    // console.log('dbid......................', dbid)
    var schemadata = async(function () {
      var result = []
      _.forEach(db, function (dbinstance) {
        // console.log('..................', dbinstance)
        if (dbinstance.id == dbid) {
          var r = await (dbinstance.conn.collection('schema').find().toArray())
          _.forEach(r, function (instance) {
            result.push(instance)
          })
        }
      })
      return result;
    });
    var res = await (schemadata())
      // console.log('schemadata getSchema',res);
    return res;
  }),

  getSchema: async(function () {
    console.log('mongo get Schema');
    // var schemadata = async(function () {
    //   var result = []
    //   _.forEach(db, function (dbinstance) {
    //     var r = await (dbinstance.conn.collection('schema').find().toArray())
    //     _.forEach(r, function (instance) {
    //       result.push(instance)
    //     })
    //   })
    //   return result;
    // });
    // var res = await (schemadata())
    var res = await (defaultDb[0].conn.collection('schema').find().toArray())
      // console.log('schemadata getSchema',res);
    return res;
  }),
  getThisSchema: async(function (id) {
    console.log('mongo get SchemaCurrent');
    if (id.length != 24) {
      return [];
    } else {
      var id = new mongoose.Types.ObjectId(id);
      // console.log('mongo get SchemaCurrent id2:',typeof id);
      // var schemadata = await (db.collection('schema').find({ _id: id }).toArray());
      // // console.log('SchemaCurrent',schemadata);
      // return schemadata[0];
      var schemadata = async(function () {
        var result = []
        _.forEach(db, function (dbinstance) {
          var r = await (dbinstance.conn.collection('schema').find({ _id: id }).toArray())
          _.forEach(r, function (instance) {
            result.push(instance)
          })
        })
        return result;
      });
      var res = await (schemadata())
        // console.log('schemadata getSchema',res);
      return res;
    }
  }),
  getflowsInstance: async(function (collName, inst_id) {
    console.log('mongo get flowsInstance');
    // var flowsInstance = async(function (collName, inst_id) {
      for (let [i, inst] of db.entries()) {
        if ( inst.id == inst_id ) {
          var r = await (inst.conn.collection(collName).find().toArray())
          // console.log('mongo r', r)
          return r
        }
      }
      // var result = []
      // _.forEach(db, function (dbinstance) {
      //   var r = await (dbinstance.conn.collection('flows-instance').find().toArray())
      //   _.forEach(r, function (instance) {
      //     result.push(instance)
      //   })
      // })
      // return result;
    // });
    // var res = await (flowsInstance(collName, inst_id))
    // return res;
    // var flowsInstance = await (db.collection('flows-instance').find().toArray());
    // // console.log('flowsInstance',flowsInstance);
    // return flowsInstance;
  }),
  getThisflowsInstance: async(function (id, collName, inst_id) {
    console.log('mongo get flowsInstanceCurrent');
    var id = new mongoose.Types.ObjectId(id);
    for (let [i, inst] of db.entries()) {
        if ( inst.id == inst_id ) {
          var r = await (inst.conn.collection(collName).find({_id: id}).toArray())
          // console.log('mongo r', r)
          return r[0]
          // for(let [inx, obj] of r.entries()) {
          //   if (obj._id == id) {
          //     return obj
          //   }
          // }
        }
      }
    // if (id.length != 24) {
    //   return [];
    // } else {
    //   var id = new mongoose.Types.ObjectId(id);
    //   var flowsInstance = async(function () {
    //     var result = []
    //     _.forEach(db, function (dbinstance) {
    //       var r = await (dbinstance.conn.collection('flows-instance').find({ _id: id }).toArray())
    //       _.forEach(r, function (instance) {
    //         result.push(instance)
    //       })
    //     })
    //     return result;
    //   });
    //   var res = await (flowsInstance())
    //   return res;
    // }
    // var id = new mongoose.Types.ObjectId(id);
    // var flowsInstance = await (db.collection('flows-instance').find({ _id: id }).toArray());
    // // console.log('flowsInstance',flowsInstance);
    // return flowsInstance[0];
  }),

  //post methods
  postSchema: async(function (data) {
    console.log('mongo post Schemax');
    // console.log('guid', data.database[1])
    // var selectedDB = _.find(db, (d) => {
    //     return d.id == data.database[1]
    //   })
      // console.log(selectedDB)
    var schema = await (defaultDb[0].conn.collection('schema').insert(data));
    // console.log(schema)
    return schema.ops;
  }),
  postflowsInstance: async(function (data, dbid, collName) {
    console.log('...................mongo post flowsInstance...................');
    // data.Schemaid = data._id
    // delete data._id
    // delete data.id
    // console.log('guid', data.database[1])
    console.log('dbid', dbid)
    // var selectedDB = _.find(db, async(function(d){
    //     return d.id == dbid
    //   }))
    var selectedDB;
    for(let i = 0; i < db.length; i++ ){
      // console.log('connid', db[i].id)
      if(db[i].id == dbid) {
        selectedDB = db[i]
      } 
    }
    // console.log('selectedDB', selectedDB)
    var schema = await (selectedDB.conn.collection(collName).insert(data));
    console.log('Generated Id:', schema.ops[0]._id)
    return schema.ops[0]._id;
    // var flowsInstance = await (db.collection('flows-instance').insert(data));
    // // var flowsInstance = await (db.collection('flows-instance').insert(data, function(err, result) {
    // //     if (err) {
    // //         console.log('Error!! from mongo post flowsInstance');
    // //         return {success: false}
    // //     } else {
    // //         console.log('Success!! from mongo post flowsInstance');
    // //         return {success: true}
    // //     }
    // // }));
    // return flowsInstance.ops;
  }),

  //put methods
  putSchema: async(function (data, id) {
    console.log('mongo put Schema');
    // delete data._id
    // console.log('guid', data.database[1])
    var id = new mongoose.Types.ObjectId(id);
    // var selectedDB = _.find(db, (d) => {
    //   return d.id == data.database[1]
    // })
    var schema = await (defaultDb[0].conn.collection('schema').updateOne({ _id: id }, { $set: data }));
    return schema;
  }),
  putflowsInstance: async(function (id, data, tableName, inst_id) {
    console.log('mongo put flowsInstance');
    delete data._id
    delete data.id
    var id = new mongoose.Types.ObjectId(id);
    // console.log('id from putflowsInstance:',id);
    var selectedDB = _.find(db, (d) => {
      return d.id == inst_id
    })
    var flowsInstance = await (selectedDB.conn.collection(tableName).updateOne({ _id: id }, { $set: data }));
    return flowsInstance.result;
  }),

  //delete methods
  // deleteSchema: async(function() {
  //     // var _data = JSON.parse(data);
  //     // console.log('mongo delete Schema');
  //  // var id = new mongoose.Types.ObjectId(id);
  //  // console.log('id from putSchema:',id);
  //  // db.collection('schema').updateOne({ _id: id }, { $set: _data }, function(err, result) {
  //  //     if (err) {
  //  //         return {success: false}
  //  //     } else {
  //  //         return {success: true}
  //  //     }
  //  // });
  //  db.collection('schema').drop(function(err, result) {
  //   if (err) {
  //          return {success: false}
  //      } else {
  //          return {success: true}
  //      }
  //  });
  // })
  deleteThisSchema: async(function (id, type) {
    console.log('mongo delete schema');
    if (id.length != 24) {
        // console.log('mongo DeleteSchema _blank');
        return [];
    } 
    else {
        // console.log('111111')
        var id = new mongoose.Types.ObjectId(id);
        if(type == 'softdel') {
            // console.log('2222')
            // var schemadata = async(function () {
            //     var result = []
            //     _.forEach(db, function (dbinstance) {
            //         var r = await (dbinstance.conn.collection('schema').updateOne({ _id: id }, {$set: {isdeleted: true}}))
            //         _.forEach(r, function (instance) {
            //             result.push(instance)
            //         })
            //     })
            //     return result;
            // });
            // var res = await (schemadata())
            // // console.log('mongo DeleteSchema',res[0]);
            // return res[0];
            var schema = await (defaultDb[0].conn.collection('schema').updateOne({ _id: id }, {$set: {isdeleted: true}}));
            return schema;
        }
    }
    // // var schema = await (db.collection('schema').deleteOne({ _id: id }));
  }),
  deleteThisflowsInstance: async(function (id, tableName, inst_id) {
    console.log('mongo delete this flowsInstance');
    var id = new mongoose.Types.ObjectId(id);
    var selectedDB = _.find(db, (d) => {
      return d.id == inst_id
    })
    var flowsInstance = await (selectedDB.conn.collection(tableName).deleteOne({ _id: id }));
    return flowsInstance;
  })

}
