var elasticsearch = require('elasticsearch');
var db1 = require('./db');
let async = require('asyncawait/async');
let await = require('asyncawait/await');
var endecrypt = require('../encryption/security')
var _ = require('lodash')
  // var databasename = 'schema_builder';
var client = [];
var dclient = [];
// var client = new elasticsearch.Client( {  
//     host: db1.elastic.host+':'+db1.elastic.port,
//     log: 'error'
//   // hosts: [
//   //   'https://[username]:[password]@[localhost]:[9200]/',
//   //   'https://[username]:[password]@[localhost]:[9200]/'
//   // ]
// });
// var db = ((db1.elastic.dbname == '') ? databasename : db1.elastic.dbname);
// client.indices.create({  
//   index: db
// })
db1.elastic.dbinstance.forEach(function (instance, inx) {
    if (instance.isenable) {
      var connection = new elasticsearch.Client({
        host: instance.host + ':' + instance.port,
        log: 'error'
          // hosts: [
          //   'https://[username]:[password]@[localhost]:[9200]/',
          //   'https://[username]:[password]@[localhost]:[9200]/'
          // ]
      });
      // var db = ((instance.dbname == '') ? databasename : instance.dbname);
      var db = instance.dbname;
      connection.indices.create({
        index: db
      }, function (err, resp) {
        if(resp) {
           //console.log(JSON.stringify(resp, null, '\t'), resp.status);
        }
      })
      client.push({ id: instance.id, conn: connection, dbname: db })
    }
    if (instance.isdefault) {
      var connection = new elasticsearch.Client({
        host: instance.host + ':' + instance.port,
        log: 'error'
          // hosts: [
          //   'https://[username]:[password]@[localhost]:[9200]/',
          //   'https://[username]:[password]@[localhost]:[9200]/'
          // ]
      });
      // var db = ((instance.dbname == '') ? databasename : instance.dbname);
      var db = instance.dbname;
      connection.indices.create({
        index: db
      }, function (err, resp) {
        if(resp) {
           //console.log(JSON.stringify(resp, null, '\t'), resp.status);
        }
      })
      dclient.push({ id: instance.id, conn: connection, dbname: db })
    }
  })

  // console.log('client',client)
  // var check = client.indices.exists({
  //     index: db
  // })
  // if(check){
  //     console.log('!!!!!');
  //     client.indices.create({
  //         index: db
  //     });
  // }else{
  //     client.indices.create({
  //         index: db
  //     });
  // }

module.exports = {
  generateInstanceTable: async(function (ins_id, title){
    console.log('Elastic generate instance collection..........', ins_id, title);
    // for(let [i, db_i] of client.entries()) {
    //   if(db_i.id == ins_id) {
    //     console.log(client[i].conn)
    //     var res = await (client[i].conn.tableCreate(title))
    //     // console.log('res......generateInstanceTable........', res)
    //     return res
    //   }
    // }
    return 'success'
  }),

  choose: function () {
    console.log('===================ELASTIC_DB=================');
  },
  //***********************get cuustom methods******************
  getSchemaName: async(function (name) {
    console.log('elastic get SchemaName');
    var schemadata = async(function () {
      var result1 = [];
      for (var i = 0; i < client.length; i++) {
        // var r = await (db[i].conn.collection('schema').find().toArray())
        var data = [];
        var result = await (
          client[i].conn.search({
            index: client[i].dbname,
            type: 'schema',
            body: {
              "query": {
        "bool": {
            "must": {
                "query_string": {
                    "fields": ["title"],
                    "query": name
                }
            },
            }
          }}}
          ))
        result.hits.hits.forEach(function (hit) {
          var item = hit._source;
          item._id = hit._id;
          data.push(item);
        })
        // console.log(client[i].id)
        for (var j = 0; j < data.length; j++) {
          result1.push(data[j])
        }
      }
      return result1;
    });
    var res = await (schemadata())
    return res;
    // var data = [];
    // var result = await (
    //   client.search({
    //     index: db,
    //     type: 'schema',
    //     body: {
    //       query: {
    //         match: {
    //           'title': name
    //         }
    //       },
    //     }
    //   }))
    // result.hits.hits.forEach(function (hit) {
    //   var item = hit._source;
    //   item._id = hit._id;
    //   data.push(item);
    // })
    // return data;
  }),

  getThisSchemaType: async(function (id, type) {
    console.log('elastic get SchemaCurrent Type');
    var schemadata = async(function () {
      var result1 = [];
      for (var i = 0; i < client.length; i++) {
        // var r = await (db[i].conn.collection('schema').find().toArray())
        var data = [];
        var result = await (
          client[i].conn.search({
            index: client[i].dbname,
            type: 'schema',
            body: {
              query: {
                 match: {
              '_id': id
            }
              },
            }
          }))
        result.hits.hits.forEach(function (hit) {
          hit._source.entity.forEach(function (item, i) {
          if (item.type === type) {
            data.push(item);
          }
        });
        })
        // console.log(client[i].id)
        for (var j = 0; j < data.length; j++) {
          result1.push(data[j])
        }
      }
      return result1;
    });
    var res = await (schemadata())
    return res;
    // var data = [];
    // var result = await (
    //   client.search({
    //     index: db,
    //     type: 'schema',
    //     body: {
    //       query: {
    //         match: {
    //           '_id': id
    //         }
    //       },
    //     }
    //   }))
    // result.hits.hits.forEach(function (hit) {
    //   hit._source.entity.forEach(function (item, i) {
    //     if (item.type === type) {
    //       data.push(item);
    //     }
    //   });
    // })
    // return data;
  }),

  getThisSchemaFieldName: async(function (id, fieldname) {
    console.log('elastic get SchemaCurrent fieldname');
    var schemadata = async(function () {
      var result1 = [];
      for (var i = 0; i < client.length; i++) {
        // var r = await (db[i].conn.collection('schema').find().toArray())
        var data = [];
        var result = await (
          client[i].conn.search({
            index: client[i].dbname,
            type: 'schema',
            body: {
              query: {
                 match: {
              '_id': id
            }
              },
            }
          }))
        result.hits.hits.forEach(function (hit) {
          hit._source.entity.forEach(function (item, i) {
          if (item.name === fieldname) {
            data.push(item);
          }
        });
        })
        // console.log(client[i].id)
        for (var j = 0; j < data.length; j++) {
          result1.push(data[j])
        }
      }
      return result1;
    });
    var res = await (schemadata())
    return res;
    // var data = [];
    // var result = await (
    //   client.search({
    //     index: db,
    //     type: 'schema',
    //     body: {
    //       query: {
    //         match: {
    //           '_id': id
    //         }
    //       },
    //     }
    //   }))
    // result.hits.hits.forEach(function (hit) {
    //   hit._source.entity.forEach(function (item, i) {
    //     if (item.name === fieldname) {
    //       data.push(item);
    //     }
    //   });
    // })
    // return data;
  }),

  getSchemaByDbid: async(function(dbid) {
    console.log('elastic get Schema By dbid...........................');
    var schemadata = async(function () {
      var result1 = [];
      for (var i = 0; i < client.length; i++) {
        // var r = await (db[i].conn.collection('schema').find().toArray())
        var data = [];
        if (client[i].id == dbid) {
          var result = await (
            client[i].conn.search({
              index: client[i].dbname,
              type: 'schema',
              body: {
                query: {
                  match_all: {}
                },
              }
            }))
          result.hits.hits.forEach(function (hit) {
            var item = hit._source;
            item._id = hit._id;
            data.push(item);
          })
          // console.log(client[i].id)
          for (var j = 0; j < data.length; j++) {
            result1.push(data[j])
          }
        }
      }
      return result1;
    });
    var res = await (schemadata())
    return res;
    // var schemadata = async(function () {
    //   var result = []
    //   _.forEach(r, function (dbinstance) {
    //     if (dbinstance.id == dbid) {
    //       var data = await (dbinstance.conn.table('schema').run())
    //       _.forEach(data, function (instance) {
    //         result.push(instance)
    //       })
    //     }
    //   })
    //   return result;
    // });
    // var res = await (schemadata())
    // return res;
  }),

  //*************get methods***************
  getSchema: async(function () {
    console.log('elastic get Schema');
    // var schemadata = async(function () {
    //   var result1 = [];
    //   for (var i = 0; i < client.length; i++) {
    //     // var r = await (db[i].conn.collection('schema').find().toArray())
    //     var data = [];
    //     var result = await (
    //       client[i].conn.search({
    //         index: client[i].dbname,
    //         type: 'schema',
    //         body: {
    //           query: {
    //             match_all: {}
    //           },
    //         }
    //       }))
    //     result.hits.hits.forEach(function (hit) {
    //       var item = hit._source;
    //       item._id = hit._id;
    //       data.push(item);
    //     })
    //     // console.log(client[i].id)
    //     for (var j = 0; j < data.length; j++) {
    //       result1.push(data[j])
    //     }
    //   }
    //   return result1;
    // });
    // var res = await (schemadata())
    // return res;

    var data = [];
    var result = await( 
    dclient[0].conn.search({
        index: dclient[0].dbname,
        type: 'schema',
        body: {
            query: {
                match_all: { }
            },
        }
    }))
    result.hits.hits.forEach(function(hit){
        var item =  hit._source;
        item._id = hit._id;
        data.push(item);
    })
    return data;

  }),
  getThisSchema: async(function (id) {
    console.log('elastic get SchemaCurrent');
    var schemadata = async(function () {
      var result1 = [];
      for (var i = 0; i < dclient.length; i++) {
        var data = [];
        var result = await (
          dclient[i].conn.search({
            index: dclient[i].dbname,
            type: 'schema',
            body: {
              query: {
                match: {
                  '_id': id
                }
              },
            }
          }))
        result.hits.hits.forEach(function (hit) {
          var item = hit._source;
          item._id = hit._id;
          data.push(item);
        })
        console.log(dclient[i].id)
        for (var j = 0; j < data.length; j++) {
          result1.push(data[j])
        }
      }
      return result1;
    });
    var res = await (schemadata())
    return res;
  }),
  getflowsInstance: async(function (typeName, inst_id) {
    console.log('elastic get flowsInstance');
    var flowsInstance = async(function () {
      var result1 = [];
      for (let [i, inst] of client.entries()) {
        if ( inst.id == inst_id ) {
          var res = await (inst.conn.search({
            index: client[i].dbname,
            type: typeName,
            body: {
              query: {
                match_all: {}
              },
            }
          }))
          // console.log('rethink r', res.hits.hits)
          res.hits.hits.forEach(function (hit) {
          var item = hit._source;
          item._id = hit._id;
          result1.push(item);
        })
          // return res
        }
      }
      return result1
      // var result1 = [];
      // for (var i = 0; i < client.length; i++) {
      //   // var r = await (db[i].conn.collection('schema').find().toArray())
      //   var data = [];
      //   var result = await (
      //     client[i].conn.search({
      //       index: client[i].dbname,
      //       type: 'instance',
      //       body: {
      //         query: {
      //           match_all: {}
      //         },
      //       }
      //     }))
      //   result.hits.hits.forEach(function (hit) {
      //     var item = hit._source;
      //     item._id = hit._id;
      //     data.push(item);
      //   })
      //   // console.log(client[i].id)
      //   for (var j = 0; j < data.length; j++) {
      //     result1.push(data[j])
      //   }
      // }
      // return result1;
    });
    var res = await (flowsInstance())
    return res;
  }),
  getThisflowsInstance: async(function (id, typeName, inst_id) {
    console.log('elastic get flowsInstanceCurrent');
    var flowsInstance = async(function () {
    var result1 = [];
      for (var i = 0; i < client.length; i++) {
        if ( client[i].id == inst_id ) {
          var data = [];
          var result = await (
            client[i].conn.search({
              index: client[i].dbname,
              type: typeName,
              body: {
                query: {
                  match: {
                    '_id': id
                  }
                },
              }
            }))
          result.hits.hits.forEach(function (hit) {
            var item = hit._source;
            item._id = hit._id;
            data.push(item);
          })
          // console.log(client[i].id)
          for (var j = 0; j < data.length; j++) {
            result1.push(data[j])
          }
        }
      }
      return result1;
    });
    var res = await (flowsInstance())
    // console.log('elastic r...', res)
    return res[0];
  }),

  //********************post methods***********************
  postSchema: async(function (data) {
    console.log('elastic post Schema', JSON.stringify(data));
    // var selectedDB = _.find(client, (d) => {
    //   return d.id == data.database[1]
    // })
    // var result = await (
    //   selectedDB.conn.index({
    //     index: selectedDB.dbname,
    //     type: 'schema',
    //     body: data
    //   }))
    // return result;

    var result = await( 
    dclient[0].conn.index({
        index: dclient[0].dbname,
        type: 'schema',
        body: data
    }))
    return result;
  }),
  postflowsInstance: async(function (data, dbid, typeName) {
    console.log('........................elastic post flowsInstance....................');
    // data.Schemaid = data._id
    // delete data._id
    // delete data.id
    // var selectedDB = _.find(client, (d) => {
    //   return d.id == dbid
    // })
    var selectedDB;
    for(let i = 0; i < client.length; i++ ){
      // console.log('connid', db[i].id)
      if(client[i].id == dbid) {
        selectedDB = client[i]
      } 
    }
    var result = await (
      selectedDB.conn.index({
        index: selectedDB.dbname,
        type: typeName,
        body: data
      }))
    return result._id;
  }),

  //**********************put methods************************
  putSchema: async(function (data, id) {
    console.log('elastic put schema')
    delete data._id
    var schemaid = id;
    // var selectedDB = _.find(client, (d) => {
    //   return d.id == data.database[1]
    // })
    var result = await (
      dclient[0].conn.index({
        index: dclient[0].dbname,
        type: 'schema',
        id: schemaid,
        body: data
      }))
    return result;
    // var schemadata = await (
    //     client.index({
    //     index: db,
    //     type: 'schema',
    //     id: schemaid,
    //     body: data
    // }))

    // return schemadata;
  }),
  putflowsInstance: async(function (id, data, tableName, inst_id) {
    var instanceid = id;
    delete data._id
    // console.log('DATA:',data);
    // var schemaid = id;
    var selectedDB = _.find(client, (d) => {
      return d.id == inst_id
    })
    var result = await (
      selectedDB.conn.index({
        index: selectedDB.dbname,
        type: tableName,
        id: instanceid,
        body: data
      }))
    return result;
    // var schemadata = await (client.index({
    //   index: db,
    //   type: 'instance',
    //   id: instanceid,
    //   body: data
    // }))
    // return schemadata;
  }),

  //******************************delete methods*************************
  // deleteSchema: async(function() {
  //     // var _data = JSON.parse(data);
  //     // console.log('elastic delete Schema');
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
  deleteThisSchema: function (id, type) {
    console.log('elastic delete this schema');
    var schemaid = id;
    let _promise = new Promise((resolve, reject) => {
        if(type == 'softdel') {
            for (var i = 0; i < dclient.length; i++) {
                // console.log(client[i].id, client[i].dbname)
                dclient[i].conn.update({
                    index: dclient[i].dbname,
                    type: 'schema',
                    id: schemaid,
                    body: {
                        doc: {
                            isdeleted: true
                        }
                    }
                  }, function(err, res){
                    // console.log(res)
                    if(res.status == 404){
                        // console.log('if...')
                        if(i == dclient.length){
                            var abc = []
                            resolve(abc)
                            // console.log('Inside..')
                        }
                    }
                    else{ 
                        // console.log('else',res)
                        resolve(res)
                    }
                  })
            }
        }
    })
    var _data = Promise.resolve(_promise).then(function(resp){
        // console.log('................',resp)
        if(resp.length == 0){
            // console.log('elastic..')
            return []
        }
        else {
            // console.log('elastic ', resp._shards)
            return resp._shards;
        }
    })
    return _data
  },
  // deleteThisSchema: async(function (id, type) {
  //   console.log('elastic delete this schema', type);
  //   var schemaid = id;
  //   if(type == 'softdel') {
  //       for (var i = 0; i < client.length; i++) {
  //           console.log(client[i].id, client[i].dbname)
  //           var result = await (
  //             client[i].conn.update({
  //               index: client[i].dbname,
  //               type: 'schema',
  //               id: schemaid,
  //               body: {
  //                   doc: {
  //                       isdeleted: true
  //                   }
  //               }
  //             }
  //             // , function(err, resp){
  //             //   console.log(JSON.stringify(resp))
  //             // }
  //             )
  //           )
  //       console.log('elastic delete: ', result)
  //       }
  //   }
  //   // return result;
    
  //   // var result = await (
  //   //     client.delete({
  //   //       index: db,
  //   //       type: 'schema',
  //   //       id: schemaid
  //   //     }))
  //   //   // console.log('result',result);
  //   // return result;

  // }),
  deleteThisflowsInstance: async(function (id, tableName, inst_id) {
    console.log('elastic delete this flowsInstance');
    var selectedDB = _.find(client, (d) => {
      return d.id == inst_id
    })
    var instanceid = id;
    var result = await (
        selectedDB.conn.delete({
          index: selectedDB.dbname,
          type: tableName,
          id: instanceid
        }))
      // console.log('result',result);
    return result;
  })

}
